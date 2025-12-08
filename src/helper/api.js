import axios from 'axios';
import CRYPTO from './crypto';

// Base API URL
// In development, use Vite proxy (/api) to avoid CORS issues
// In production, use the actual URL
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'  // Development: Use Vite proxy
  : 'https://bluegrape.app/sispay/webservices';  // Production: Direct URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor for logging and token handling
apiClient.interceptors.request.use(
  (config) => {
    // You can add authorization token here if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Generic API call function with encryption/decryption
 * @param {String} endpoint - API endpoint (e.g., '/getMasterLogin.php')
 * @param {Object} data - Data to send
 * @param {Boolean} shouldDecrypt - Whether to decrypt the response (default: true)
 * @returns {Promise} - Promise with decrypted response data
 */
export const apiCall = async (endpoint, data = {}, shouldDecrypt = true) => {
  try {
    // Convert data to URL-encoded format as expected by PHP
    // PHP expects: data=<value>
    const formData = new URLSearchParams();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    formData.append('data', dataString);

    console.log(`API Call to ${endpoint}:`, {
      endpoint,
      dataString: dataString.substring(0, 200) + '...',
      shouldDecrypt
    });

    // Make POST request
    const response = await apiClient.post(endpoint, formData);

    // Check if response has encrypted data
    if (shouldDecrypt && response.data && response.data.data) {
      // Decrypt the response data
      // PHP returns: {"data": "publicKey16chars+encryptedCipher"}
      const decryptedData = CRYPTO.decrypt(response.data.data);

      // If decrypted data has records, decode rawurlencoded values
      if (decryptedData.records && Array.isArray(decryptedData.records)) {
        decryptedData.records = decryptedData.records.map((record) =>
          CRYPTO.decodeRawUrl(record)
        );
      }

      return {
        success: true,
        data: decryptedData,
      };
    }

    // If no encryption or no data field, return as-is
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred',
      details: error.response?.data || null,
    };
  }
};

// Authentication API calls
/**
 * Login user
 * @param {Object} params - Login parameters {username, password}
 * @returns {Promise} - Login response
 */
export function apiLogin(params) {
  try {
    const response = axios({
      method: 'post',
      url: API_BASE_URL + '/login.php',
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Check if user session is valid
 * @returns {Promise} - Session check response
 */
export function checkSession() {
  try {
    const response = axios({
      method: 'post',
      url: API_BASE_URL + '/checkSession.php',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Get Master Login (raw function without encryption handling)
 * @returns {Promise} - Raw axios response
 */
export function getMasterLogin() {
  try {
    const response = axios({
      method: 'post',
      url: API_BASE_URL + '/getMasterLogin.php',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// User Management API calls (with encryption/decryption)
export const userAPI = {
  /**
   * Get list of all users (with decryption)
   */
  getMasterLogin: async () => {
    return await apiCall('/getMasterLogin.php', {});
  },

  /**
   * Delete a user by login
   * @param {String} login - User login to delete
   */
  deleteMasterLogin: async (login) => {
    return await apiCall('/deleteMasterLogin.php', { login });
  },

  /**
   * Create or update user
   * @param {Object} userData - User data
   */
  saveMasterLogin: async (userData) => {
    try {
      // Encrypt data the same way as AngularJS
      const jsonData = CRYPTO.encrypt(userData);
      console.log('Encrypted data:', jsonData.substring(0, 100));

      // Send in the same format as AngularJS: { 'data': jsonData }
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/saveLogin.php', formData);

      console.log('Save response:', response.data);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save user',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant list
   */
  getMasterMerchantList: async () => {
    return await apiCall('/getMasterMerchantList.php', {});
  },

  /**
   * Get menu navigation list
   */
  getMenuNav: async () => {
    return await apiCall('/getMenuNav.php', {});
  },

  /**
   * Get agent group list
   * Note: This endpoint returns unencrypted data with status 'success'
   */
  getAgentGroup: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('searchkey', '');

      const response = await apiClient.post('/agentgroup/list.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get login status list
   */
  getLoginStatusList: async () => {
    return await apiCall('/masterLoginForm_getLoginStatusList.php', {});
  },

  /**
   * Save agent group (create or update)
   * @param {Object} groupData - Group data { id, name, status }
   */
  saveAgentGroup: async (groupData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', groupData.id);
      formData.append('name', groupData.name);
      formData.append('status', groupData.status);

      const response = await apiClient.post('/agentgroup/save.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save agent group',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Delete agent group
   * @param {String} id - Agent group ID to delete
   */
  deleteAgentGroup: async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', id);

      const response = await apiClient.post('/agentgroup/delete.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete agent group',
        details: error.response?.data || null,
      };
    }
  },
};

// Automation Management API calls
export const automationAPI = {
  /**
   * Get automation list
   * Note: This endpoint returns unencrypted data
   */
  getAutomationList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', 'get'); // Send non-empty value to avoid PHP null error

      const response = await apiClient.post('/automationCreate_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Delete automation account
   * @param {String} username - Username to delete
   */
  deleteAutomation: async (username) => {
    try {
      const data = { username };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/deleteAutomationList.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Create automation account
   * @param {Object} automationData - Automation data
   */
  createAutomation: async (automationData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', automationData);

      const response = await apiClient.post('/automationCreate_create.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Create error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create',
        details: error.response?.data || null,
      };
    }
  },
};

// Server Management API calls
export const serverAPI = {
  /**
   * Get server list
   * Note: This endpoint returns unencrypted data
   */
  getServerList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/serverList_getList.php', formData);

      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Create server
   * @param {Object} serverData - Server data { name, address, password }
   */
  createServer: async (serverData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(serverData));

      const response = await apiClient.post('/serverList_create.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Create error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create server',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update server
   * @param {Object} serverData - Server data { name, address, password }
   */
  updateServer: async (serverData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(serverData));

      const response = await apiClient.post('/serverList_update.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update server',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Delete server
   * @param {String} name - Server name to delete
   */
  deleteServer: async (name) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ name }));

      const response = await apiClient.post('/serverList_delete.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete server',
        details: error.response?.data || null,
      };
    }
  },
};

// Master MyBank API calls
export const myBankAPI = {
  /**
   * Get master mybank list
   */
  getMasterMyBank: async () => {
    return await apiCall('/getMasterMyBank.php', {});
  },

  /**
   * Delete mybank record
   * @param {String} bankAccNo - Account number
   * @param {String} bankCode - Bank code
   */
  deleteMasterMyBank: async (bankAccNo, bankCode) => {
    try {
      const payload = { bankAccNo, bankCode };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/deleteMasterMyBank.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete mybank error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete mybank',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Create or update mybank record
   * @param {Object} payload - Form data payload
   */
  saveMasterMyBank: async (payload) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/saveMasterMyBank.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save mybank error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save mybank',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant list for a bank account/bank code (grouped)
   * @param {String} bankaccountno
   * @param {String} bankcode
   */
  getMasterMerchantForBank: async (bankaccountno = '', bankcode = '') => {
    try {
      const payload = { bankaccountno, bankcode };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/mybank_getMasterMerchant.php',
        formData
      );

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get master merchant error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchants',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Group selected accounts
   * @param {String} groupname - Target group name
   * @param {Array} items - Array of { account, bank }
   */
  groupAccounts: async (groupname, items) => {
    try {
      const payload = { groupname, items };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/groupMyBank.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Group mybank error:', error);
      return {
        success: false,
        error: error.message || 'Failed to group accounts',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Assign upline to selected accounts
   */
  setUpline: async (groupname, items) => {
    try {
      const payload = { groupname, items };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/groupMyBank2.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Set upline error:', error);
      return {
        success: false,
        error: error.message || 'Failed to set upline',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Mark issue for selected accounts
   */
  setIssue: async (groupname, items) => {
    try {
      const payload = { groupname, items };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/groupMyBank3.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Set issue error:', error);
      return {
        success: false,
        error: error.message || 'Failed to set issue',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get last transactions by account and bank
   */
  getLastTransaction: async (account, bank) => {
    try {
      const payload = { account, bank };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getLastTransaction.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);

        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get last transaction error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load last transaction',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get MyBank balance list (response is plain JSON string inside data.data)
   */
  getMyBankBalance: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getMasterMyBankBalance.php', formData, {
        // Balance endpoint can be slow; give it more time
        timeout: 120_000,
      });

      // Some responses wrap JSON string in data.data, others return object directly
      if (response.data) {
        if (response.data.data) {
          try {
            const parsed = JSON.parse(response.data.data);
            return { success: true, data: parsed };
          } catch (e) {
            // Fallback: if already parsed object
            if (typeof response.data.data === 'object') {
              return { success: true, data: response.data.data };
            }
            return {
              success: false,
              error: 'Failed to parse balance response',
              details: response.data,
            };
          }
        }
        // Already usable shape
        return { success: true, data: response.data };
      }

      return {
        success: false,
        error: 'Empty response',
        details: null,
      };
    } catch (error) {
      console.error('Get mybank balance error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load mybank balance',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get inactive mybank list
   */
  getInactiveList: async () => {
    try {
      const response = await apiClient.post(
        '/newGetMasterBankInactive.php',
        { data: '' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.data) {
        const payload = response.data.data;
        const records = Array.isArray(payload.records)
          ? payload.records.map((rec) => CRYPTO.decodeRawUrl(rec))
          : [];
        return {
          success: true,
          data: {
            ...payload,
            records,
          },
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get inactive mybank error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load inactive mybank',
        details: error.response?.data || null,
        };
      }
    },

  /**
   * Get MyBank inactive log list
   */
  getInactiveLog: async () => {
    try {
      const encrypted = CRYPTO.encrypt({});
      const formData = new URLSearchParams();
      formData.append('data', encrypted);

      const response = await apiClient.post('/mybankInactiveLog_getList.php', formData);
      const payload = response.data?.data || response.data || {};
      const rawRecords =
        Array.isArray(payload.records) && payload.records.length > 0
          ? payload.records
          : Array.isArray(response.data?.records)
            ? response.data.records
            : [];

      const records = rawRecords.map((rec) => CRYPTO.decodeRawUrl(rec));

      return {
        success: true,
        data: {
          ...payload,
          records,
        },
      };
    } catch (error) {
      console.error('Get inactive mybank log error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load inactive mybank log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update inactive/active status for selected accounts
   * @param {String} button - active | inactive | deactive | deposit | withdraw | withdraw and deposit
   * @param {Array} items - Array of { account, bank }
   */
  updateInactiveStatus: async (button, items) => {
    try {
      const response = await apiClient.post(
        '/updateStatusMyBank.php',
        { data: { button, items } },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update inactive status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get master bank list (encrypted response)
   */
  getMasterBank: async () => {
    return await apiCall('/getMasterBank.php', {});
  },

  /**
   * Update bank active status (turn on/off all agents)
   * @param {Object} payload - { bank, merchant, status }
   */
  updateBankStatus: async (payload) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/updateMybank.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update bank status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update bank status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update merchant selection for bank
   * @param {Object} payload - { merchant, bank, merchantStatus }
   */
  updateMerchantStatus: async (payload) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/updateMybankMerchant.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update merchant status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update merchant status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update agent type (deposit/withdraw/both)
   * @param {Object} payload - { bank, type }
   */
  updateAgentType: async (payload) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/updateMybankType.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update agent type error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update agent type',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update status for selected mybank records
   * @param {Object} payload - { button, items }
   */
  updateStatusSelected: async (payload) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/updateStatusMyBankSelected.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update status selected error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update selected status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get MyBank limit list (encrypted)
   */
  getMyBankLimit: async () => {
    return await apiCall('/getMasterMyBankLimit.php', {});
  },

  /**
   * Get MyBank deactive list (encrypted)
   */
  getDeactiveBankList: async () => {
    return await apiCall('/getMasterMyDeactiveBank.php', {});
  },
};

// Agent Onboard API calls
export const onboardAPI = {
  /**
   * Get onboard agent list (not encrypted)
   */
  getOnboardAgents: async () => {
    try {
      const response = await apiClient.post(
        '/getOnboardAgent.php',
        { data: '' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get onboard agent error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load onboard agents',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update onboard date for selected agents (encrypted)
   * @param {String} date - YYYY-MM-DD
   * @param {Array} items - Array of { account, bank }
   */
  updateOnboardDate: async (date, items) => {
    try {
      const payload = { date, items };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/updateOnboardAgent.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update onboard date error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update onboard date',
        details: error.response?.data || null,
      };
    }
  },
};

// Agent Commission Settlement API calls
export const agentCommissionAPI = {
  /**
   * Get commission settlement list
   * @param {String} from - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} to - To date (YYYY-MM-DD HH:mm:ss)
   */
  getCommissionSettlementList: async (from, to) => {
    try {
      const formData = new URLSearchParams();
      formData.append('from', from);
      formData.append('to', to);

      const response = await apiClient.post(
        '/agent/cp_get_commission_settlement_list.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Approve commission settlement
   * @param {String} id - Settlement ID to approve
   */
  approveCommissionSettlement: async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', id);

      const response = await apiClient.post(
        '/agent/cp_commission_settlement_approve.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Approve error:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve settlement',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Reject commission settlement
   * @param {String} id - Settlement ID to reject
   * @param {String} reason - Rejection reason
   */
  rejectCommissionSettlement: async (id, reason) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', id);
      formData.append('reason', reason);

      const response = await apiClient.post(
        '/agent/cp_commission_settlement_reject.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Reject error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject settlement',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent credit balance list
   */
  getCreditBalance: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post(
        '/agent/cp_credit_balance.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Credit adjustment (in/out)
   * @param {Object} adjustmentData - { username, adjustType, amount, bankAccountNo, bankCode }
   */
  creditAdjustment: async (adjustmentData) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', adjustmentData.username);
      formData.append('adjustType', adjustmentData.adjustType);
      formData.append('amount', adjustmentData.amount);
      formData.append('bankAccountNo', adjustmentData.bankAccountNo);
      formData.append('bankCode', adjustmentData.bankCode);

      const response = await apiClient.post(
        '/agent/cp_credit_adjustment.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Adjustment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to adjust credit',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get credit request list
   * @param {String} from - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} to - To date (YYYY-MM-DD HH:mm:ss)
   */
  getCreditRequestList: async (from, to) => {
    try {
      const formData = new URLSearchParams();
      formData.append('from', from);
      formData.append('to', to);

      const response = await apiClient.post(
        '/agent/cp_get_credit_request_list.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Approve credit request
   * @param {String} id - Request ID to approve
   */
  approveCreditRequest: async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', id);

      const response = await apiClient.post(
        '/agent/cp_credit_approve.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Approve error:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve request',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Reject credit request
   * @param {String} id - Request ID to reject
   * @param {String} reason - Rejection reason
   */
  rejectCreditRequest: async (id, reason) => {
    try {
      const formData = new URLSearchParams();
      formData.append('id', id);
      formData.append('reason', reason);

      const response = await apiClient.post(
        '/agent/cp_credit_reject.php',
        formData
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Reject error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject request',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent current balance (live data)
   * NOTE: Matching AngularJS version - sends empty data (no parameters)
   * Response is ENCRYPTED, needs decryption
   */
  getCurrentBalance: async () => {
    try {
      console.log('Calling getCurrentBalance API...');

      const response = await apiClient.post(
        '/getTransactionByAgentLive_new.php',
        ''
      );

      console.log('getCurrentBalance raw response:', response);
      console.log('getCurrentBalance response data:', response.data);
      console.log('getCurrentBalance response data type:', typeof response.data);

      // Check if response has encrypted data
      if (response.data && response.data.data) {
        console.log('Response is encrypted, decrypting...');

        // Decrypt the response data
        // PHP returns: {"data": "publicKey16chars+encryptedCipher"}
        const decryptedData = CRYPTO.decrypt(response.data.data);
        console.log('Decrypted data:', decryptedData);

        // If decrypted data has records, decode rawurlencoded values
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          console.log('Decoding rawurl values for records...');
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      // If no encryption, return as-is
      console.log('Response is not encrypted, returning as-is');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('getCurrentBalance API call error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transaction summary by agent
   * @param {String} from - Start date (YYYY-MM-DD HH:mm:ss format)
   * @param {String} to - End date (YYYY-MM-DD HH:mm:ss format)
   * @param {Boolean} includeZero - Include zero credit agents
   */
  getTransactionSummary: async (from, to, includeZero) => {
    try {
      const data = {
        from: from,
        to: to,
        includeZero: includeZero,
      };

      const response = await apiClient.post(
        '/agentTransactionSummary_getList_new.php',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },
};

// Deposit Dashboard API calls
export const depositAPI = {
  /**
   * Get deposit dashboard summary (not encrypted)
   */
  getDashboardMetrics: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}'); // send non-empty payload to match PHP expectations

      const response = await apiClient.post('/depositDashboard.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit dashboard API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit dashboard',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit pending list (not encrypted)
   * @param {String} date - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   * @param {String} filter - A | 9 | T | 0 | 1
   */
  getPendingList: async (date, dateto, filter) => {
    try {
      const payload = { data: { date, dateto, filter } };
      const response = await apiClient.post('/GetDepositPendingList.php', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit pending list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Bulk fail selected deposit items (not encrypted)
   * @param {Array} items - Selected rows
   */
  failBulk: async (items = []) => {
    try {
      const formData = new URLSearchParams();
      items.forEach((item, idx) => {
        Object.entries(item).forEach(([key, value]) => {
          formData.append(`data[items][${idx}][${key}]`, value ?? '');
        });
      });

      const response = await apiClient.post('/failedBulkDepositList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Fail bulk deposit list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fail selected items',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Mybank check deposit list (encrypted request)
   * @param {{ from: string, to: string }} params - Date range with time e.g. 'YYYY-MM-DD HH:mm:ss'
   */
  getMybankCheckDepositList: async ({ from, to } = {}) => {
    const decodeRecord = (record = {}) =>
      Object.entries(record || {}).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          try {
            acc[key] = decodeURIComponent(value);
          } catch (_) {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

    try {
      const payload = { from, to };
      const encrypted = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', encrypted);
      // Include plain payload for servers that accept raw JSON (backward compatibility)
      formData.append('payload', JSON.stringify(payload));

      const response = await apiClient.post('/mybankCheckDeposit_getList.php', formData);
      const payloadData = response.data?.data
        ? CRYPTO.decrypt(response.data.data)
        : response.data;

      const records = Array.isArray(payloadData?.records)
        ? payloadData.records.map(decodeRecord)
        : [];

      return {
        success: true,
        data: {
          ...payloadData,
          records,
        },
      };
    } catch (error) {
      console.error('Mybank check deposit list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load Mybank check deposit list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Check automation live status (plain request)
   * @param {{ phoneNumber: string, bankCode: string }} params
   */
  checkAutomationLive: async ({ phoneNumber = '', bankCode = '' } = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ phoneNumber, bankCode }));

      const response = await apiClient.post('/check_automation_live.php', formData);
      const payload = response.data?.data ? CRYPTO.decrypt(response.data.data) : response.data;

      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      console.error('Check automation live API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check automation status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Toggle Mybank check deposit crawling
   * @param {{ agent: string, bank: string, status: number, dateFrom?: string, dateTo?: string }} params
   */
  setCheckDepositStatus: async ({
    agent = '',
    bank = '',
    status = 0,
    dateFrom = '',
    dateTo = '',
  } = {}) => {
    try {
      const payload = {
        agent,
        bank,
        status,
        dateForm: dateFrom,
        dateTo,
      };

      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/setCheckDepositOn.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Set check deposit status API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update check deposit status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Match deposit queue mutation(s) to a future transaction (encrypted)
   * @param {{ futuretrxid?: string, ids: Array<string|number> }} params
   */
  matchDepositQueue: async ({ futuretrxid = '', ids = [] } = {}) => {
    try {
      const payload = {
        futuretrxid,
        id: Array.isArray(ids) ? ids : [ids],
      };

      const encrypted = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', encrypted);

      const response = await apiClient.post('/depositQueue_matchedMutasi.php', formData);
      const payloadData = response.data?.data
        ? CRYPTO.decrypt(response.data.data)
        : response.data;

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Match deposit queue API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to match deposit queue',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit pending by transaction ID (encrypted)
   * @param {String} transId - Transaction ID
   */
  getPendingByTransId: async (transId) => {
    try {
      const payload = { transId };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/depositPending_getTransactionByTransId.php',
        formData
      );

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit pending by transId API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit pending data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get automation deposit list (not encrypted)
   * @param {String} dateFrom - YYYY-MM-DD
   * @param {String} dateTo - YYYY-MM-DD
   * @param {String} filter - status filter
   * @param {String} agent - account filter
   */
  getAutomationList: async (dateFrom, dateTo, filter, agent = '') => {
    try {
      const payload = { data: { dateFrom, dateTo, filter, agent } };
      const response = await apiClient.post('/new_deposit_getList.php', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Automation deposit list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load automation deposit list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Bulk fail automation deposit items (encrypted)
   * @param {Array<{futuretrxid: string, memo: string}>} items
   */
  bulkFailAutomationDeposit: async (items = []) => {
    try {
      const jsonData = CRYPTO.encrypt({ type: 'bulkFailDeposit', items });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transaction_bulkFail.php', formData);

      if (response.data?.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Automation deposit bulk fail API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk fail deposits',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get automation agent list (deduplicated) - returns decrypted data
   */
  getAutomationAgents: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getMasterMyBankNew.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Automation agent list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agents',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit queue today (encrypted)
   * @param {Object} payload - { accountno, bank }
   */
  getDepositQueueToday: async ({ accountno = '', bank = '' } = {}) => {
    try {
      const jsonData = CRYPTO.encrypt({ accountno, bank });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/depositQueue_getTransactionToday.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit queue today API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit queue today',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit queue by date range (encrypted)
   * @param {Object} payload - { accountno, bank, datefrom, dateto }
   */
  getDepositQueueByDate: async ({
    accountno = '',
    bank = '',
    datefrom = '',
    dateto = '',
  } = {}) => {
    try {
      const jsonData = CRYPTO.encrypt({ accountno, bank, datefrom, dateto });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/depositQueue_getTransaction.php',
        formData
      );

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit queue by date API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit queue',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit queue today BDT (encrypted)
   * @param {Object} payload - { accountno, bank }
   */
  getDepositQueueTodayBDT: async ({ accountno = '', bank = '' } = {}) => {
    try {
      const jsonData = CRYPTO.encrypt({ accountno, bank });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/depositQueue_getTransactionTodayBDT.php',
        formData
      );

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit queue today BDT API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit queue today BDT',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get deposit queue alert (encrypted)
   */
  getDepositQueueAlert: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post(
        '/depositQueueAlert_getData.php',
        formData
      );

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Deposit queue alert API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load deposit queue alert',
        details: error.response?.data || null,
      };
    }
  },
};

// SMS Log API calls
export const smsAPI = {
  /**
   * Get SMS log by Transaction ID (encrypted)
   * @param {Object} params - { trxId: string, history?: boolean, similarSearch?: boolean }
   */
  getLogById: async ({ trxId, history = false, similarSearch = false } = {}) => {
    try {
      const payload = { id: trxId, history, similarSearch };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLog_getById.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log by ID API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Expire a specific SMS (encrypted)
   * @param {Object} params - { amount, bank, trxid, phonenumber }
   */
  expireSms: async ({ amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLog_expireSms.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS expire API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to expire SMS',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Match SMS to a transaction (encrypted)
   * @param {Object} params - { futuretrxid, amount, bank, trxid, phonenumber }
   */
  matchSms: async ({ futuretrxid, amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { futuretrxid, amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLog_saveMatchTransaction.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS match API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to match SMS',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Criteria Not Matching by Transaction ID (encrypted)
   * @param {Object} params - { trxId: string, history?: boolean }
   */
  getCriteriaNotMatchingById: async ({ trxId, history = false } = {}) => {
    try {
      const payload = { id: trxId, history };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsCriteriaNotMatchingById.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS criteria not matching by ID API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS criteria not matching data',
        details: error.response?.data || null,
      };
    }
  },

    /**
     * Get SMS log list (not encrypted)
     * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string, type: string, user: string }
     */
    getLogList: async ({ datefrom, dateto, type = '2', user = '' } = {}) => {
      try {
        const payload = {
          datefrom: datefrom ?? '',
          dateto: dateto ?? '',
          type: type ?? '2',
          user: user ?? '',
        };

        // Wrap inside `data` to match backend expectation ($param_POST->data)
        const response = await apiClient.post('/smsLog_getList.php', { data: payload }, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.data && response.data.data) {
          const parsed = typeof response.data.data === 'string'
            ? JSON.parse(response.data.data)
            : response.data.data;

        if (parsed.records && Array.isArray(parsed.records)) {
          parsed.records = parsed.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: parsed,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS phone user list (not encrypted)
   */
  getPhoneUserList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/smsLog_getPhoneUserList.php', formData);
      if (response.data && response.data.data) {
        const parsed = response.data.data;
        return {
          success: true,
          data: parsed,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS phone user list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load phone user list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS log backup list (encrypted payload, plaintext response)
   * @param {Object} params - { datefrom: string, dateto: string, type?: string, user?: string }
   */
  getLogBackupList: async ({ datefrom, dateto, type = '2', user = '' } = {}) => {
    try {
      const payload = { datefrom, dateto, type, user };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogBackup_getList.php', formData);

      const parsed = response.data?.status ? response.data : response.data?.data;
      if (parsed?.records && Array.isArray(parsed.records)) {
        parsed.records = parsed.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: parsed || response.data,
      };
    } catch (error) {
      console.error('SMS log backup list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log backup',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS log backup phone user list (encrypted payload, plaintext response)
   */
  getBackupPhoneUserList: async () => {
    try {
      const jsonData = CRYPTO.encrypt({ data: '' });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogBackup_getPhoneUserList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log backup phone user list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load backup phone users',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Expire an SMS from backup list (encrypted)
   */
  expireBackupSms: async ({ amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogBackup_expireSms.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log backup expire API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to expire SMS (backup)',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Match an SMS from backup list (encrypted)
   */
  matchBackupSms: async ({ futuretrxid, amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { futuretrxid, amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogBackup_saveMatchTransaction.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log backup match API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to match SMS (backup)',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS log by balance difference (not encrypted request)
   * @param {Object} params - { type: '0' | '1' | '2' }
   */
  getLogByBalanceDiff: async ({ type = '0' } = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data[type]', type);

      const response = await apiClient.post('/smsLog_getByBalanceDiff.php', formData);

      const payload = response.data?.data
        ? JSON.parse(response.data.data)
        : response.data;

      if (payload?.records && Array.isArray(payload.records)) {
        payload.records = payload.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payload || response.data,
      };
    } catch (error) {
      console.error('SMS log by balance diff API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log by balance diff',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS log by customer phone (encrypted)
   * @param {Object} params - { customerPhone: string }
   */
  getLogByCustomerPhone: async ({ customerPhone } = {}) => {
    try {
      const payload = { customerPhone };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLog_getByCustomerPhone.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log by customer phone API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log by customer phone',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get suspected SMS list (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59), user?: string }
   */
  getSuspectedSmsList: async ({ datefrom, dateto, user = '' } = {}) => {
    try {
      const payload = { datefrom, dateto, user };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/suspectedSms_getList.php', formData);

      const parsed = response.data?.data ? response.data.data : response.data;
      const dataPayload = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;

      if (dataPayload?.records && Array.isArray(dataPayload.records)) {
        dataPayload.records = dataPayload.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: dataPayload || response.data,
      };
    } catch (error) {
      console.error('Suspected SMS list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load suspected SMS data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get suspected customer summary (encrypted)
   */
  getSuspectedCustomerList: async () => {
    try {
      const payload = {};
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/suspectedCustomer_getList.php', formData);

      const parsed = response.data?.data ? response.data.data : response.data;
      const dataPayload = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;

      return {
        success: true,
        data: dataPayload || response.data,
      };
    } catch (error) {
      console.error('Suspected customer list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load suspected customer data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Mark suspected customer as checked (encrypted)
   * @param {Object} params - { customerPhone: string }
   */
  setSuspectedCustomerChecked: async ({ customerPhone }) => {
    try {
      const payload = { customerPhone };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/suspectedCustomer_checked.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Suspected customer checked API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to flag suspected customer',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Failed Match list (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59), history?: boolean }
   */
  getFailedMatchList: async ({ datefrom, dateto, history = false } = {}) => {
    try {
      const payload = { datefrom, dateto, history };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsFailedMatch_getList.php', formData);

      const parsed = response.data?.data ? response.data.data : response.data;
      const dataPayload = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;

      return {
        success: true,
        data: dataPayload || response.data,
      };
    } catch (error) {
      console.error('SMS failed match list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS failed match data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Bulk fail SMS failed match items (encrypted)
   */
  bulkFailFailedMatch: async (list = []) => {
    try {
      const jsonData = CRYPTO.encrypt({ list });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsFailedMatch_bulkFail.php', formData);
      const parsed = response.data?.data ? response.data.data : response.data;
      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      console.error('SMS failed match bulk fail API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk fail items',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Bulk success SMS failed match items (encrypted)
   */
  bulkSuccessFailedMatch: async (list = []) => {
    try {
      const jsonData = CRYPTO.encrypt({ list });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsFailedMatch_bulkSuccess.php', formData);
      const parsed = response.data?.data ? response.data.data : response.data;
      return {
        success: true,
        data: parsed,
      };
    } catch (error) {
      console.error('SMS failed match bulk success API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk success items',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Failed Match by Not Match Sameday list (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59) }
   */
  getFailedMatchByNotMatchSameday: async ({ datefrom, dateto } = {}) => {
    try {
      const payload = { datefrom, dateto };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsFailedMatchByNotMatchSameday_getList.php', formData);

      // Legacy API returns plain JSON in response.data
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS failed match by not match sameday API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS failed match by not match sameday data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get duplicate SMS list (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59) }
   */
  getDuplicateSmsList: async ({ datefrom, dateto } = {}) => {
    try {
      const payload = { datefrom, dateto };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/duplicateSms_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Duplicate SMS list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load duplicate SMS data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS log history (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59), type?: string, user?: string }
   */
  getLogHistory: async ({ datefrom, dateto, type = '2', user = '' } = {}) => {
    try {
      const payload = { datefrom, dateto, type, user };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogHistory_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log history API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS log history',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Expire an SMS from history (encrypted)
   */
  expireSmsHistory: async ({ amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogHistory_expireSms.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log history expire API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to expire SMS history item',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Match an SMS from history (encrypted)
   */
  matchSmsHistory: async ({ futuretrxid, amount, bank, trxid, phonenumber }) => {
    try {
      const payload = { futuretrxid, amount, bank, trxid, phonenumber };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLogHistory_saveMatchTransaction.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS log history match API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to match SMS history item',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Last ACK list (encrypted)
   * @param {Object} params - optional { datefrom, dateto } for future compatibility
   */
  getLastAckList: async ({ datefrom = '', dateto = '' } = {}) => {
    try {
      const payload = datefrom && dateto ? { datefrom, dateto } : { data: '' };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLastAck_getData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS last ACK API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS last ACK data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Last ACK Active list (encrypted)
   * @param {Object} params - optional { datefrom, dateto } for future compatibility
   */
  getLastAckActiveList: async ({ datefrom = '', dateto = '' } = {}) => {
    try {
      const payload = datefrom && dateto ? { datefrom, dateto } : { data: '' };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/smsLastAckActive_getData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS last ACK active API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS last ACK active data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS report (encrypted)
   * @param {Object} params - { datefrom: string (YYYY-MM-DD 00:00:00), dateto: string (YYYY-MM-DD 23:59:59) }
   */
  getReportSms: async ({ datefrom, dateto } = {}) => {
    try {
      const payload = { datefrom, dateto };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/reportSms_getReport.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('SMS report API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load SMS report data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get phone whitelist (encrypted)
   */
  getPhoneWhitelist: async () => {
    try {
      const jsonData = CRYPTO.encrypt({ data: '' });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/phoneWhitelist_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Phone whitelist API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load phone whitelist',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get service center whitelist (encrypted)
   */
  getServiceCenterWhitelist: async () => {
    try {
      const jsonData = CRYPTO.encrypt({ data: '' });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/serviceCenterWhitelist_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Service center whitelist API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load service center whitelist',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save phone whitelist entry (encrypted)
   * @param {Object} params - { id?: number|string|null, phoneNumber: string, description?: string, isActive?: 'Y'|'N' }
   */
  savePhoneWhitelist: async ({ id = null, phoneNumber, description = '', isActive = 'Y' }) => {
    try {
      const payload = { id, phoneNumber, description, isActive };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/phoneWhitelistForm_saveData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save phone whitelist API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save phone whitelist',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save service center whitelist entry (encrypted)
   * @param {Object} params - { id?: number|string|null, serviceCenter: string, description?: string, isActive?: 'Y'|'N', maxAmountAllowed?: number }
   */
  saveServiceCenterWhitelist: async ({
    id = null,
    serviceCenter,
    description = '',
    isActive = 'Y',
    maxAmountAllowed = 0,
  }) => {
    try {
      const payload = { id, serviceCenter, description, isActive, maxAmountAllowed };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/serviceCenterWhitelistForm_saveData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save service center whitelist API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save service center whitelist',
        details: error.response?.data || null,
      };
    }
  },
};

// Transaction by ID API calls
export const transactionAPI = {
  /**
   * Get transaction(s) by Transaction ID (encrypted)
   * @param {Object} params - { transId: string, history?: boolean, similarSearch?: boolean }
   */
  getByTransactionId: async ({ transId, history = false, similarSearch = false }) => {
    try {
      const payload = { transId, history, similarSearch };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionById_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction by ID API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transaction data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transaction(s) by Transaction ID Backup (encrypted)
   * @param {String} transId - Transaction ID
   */
  getBackupByTransactionId: async (transId) => {
    try {
      const payload = { transId };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionByIdBackup_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction by ID Backup API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transaction backup data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transaction(s) by Transaction ID (backup equals)
   * @param {Object} params - { transId: string, type?: 'current' | 'history' | 'archive' }
   */
  getByTransactionIdNew: async ({ transId, type = 'current' }) => {
    try {
      const payload = { transId, type };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionByIdNew_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction by ID New API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transaction data (new)',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Find Transaction Member list (not encrypted)
   */
  getFindTransactionMemberList: async () => {
    try {
      const response = await apiClient.post('/findTransactionMember_getList.php', '');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Find Transaction Member API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transaction member data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get rejected transactions (encrypted)
   */
  getRejectedTransactions: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getTransactionRejected.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Rejected transactions API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load rejected transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Find Trxid by Transaction ID (not encrypted)
   * @param {String} transId
   */
  findTrxidByTransId: async (transId) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data[transId]', transId);

      const response = await apiClient.post('/GetTrxidArchive.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Find trxid by transId API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load trxid data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Change trxid in archive (not encrypted)
   * @param {String} trxid
   */
  changeTrxidArchive: async (trxid) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data[trxid]', trxid);

      const response = await apiClient.post('/updateTrxidArchive.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Change trxid archive API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to change trxid',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transaction by account (encrypted)
   * @param {Object} params - { datefrom, dateto, accountno, bank, isPending }
   */
  getTransactionByAccount: async ({ datefrom, dateto, accountno = '0', bank = '', isPending = '0' }) => {
    try {
      const payload = { datefrom, dateto, accountno, bank, isPending };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionAccountByCompany.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = JSON.parse(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction by account API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transactions by account',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get MyBank account list (not encrypted)
   */
  getMyBankList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getMyBank.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('MyBank list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load account list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get available account date list (encrypted)
   */
  getAvailableAccountDates: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getAvailableAccountDate.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Available account dates API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load available dates',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update group priority for selected filters (plain payload)
   * @param {Object} payload - { date, bank, group }
   */
  updateGroupPriority: async (payload = {}) => {
    try {
      const response = await apiClient.post(
        '/updateGroup.php',
        { data: payload },
        { headers: { 'Content-Type': 'application/json' } }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update group priority error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update group',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transaction by account history (encrypted)
   * @param {Object} params - { datefrom, dateto, accountno, bank, isPending }
   */
  getTransactionByAccountHistory: async ({ datefrom, dateto, accountno = '0', bank = '', isPending = '0' }) => {
    try {
      const payload = { datefrom, dateto, accountno, bank, isPending };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionHistory.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = JSON.parse(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction history API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load transaction history',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transactions with empty callback (encrypted request, plain response)
   * @param {String} date - YYYY-MM-DD
   */
  getTransactionCallbackEmpty: async (date) => {
    try {
      const payload = { date };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionCallbackEmpty_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction callback empty API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load empty-callback transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Resend callbacks for given future trx ids (not encrypted)
   * @param {Array} ids - array of { id: futuretrxid }
   */
  resendTransactionCallbackEmpty: async (ids = []) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(ids));

      const response = await apiClient.post('/transactionCallbackEmpty_resendCallback.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resend callback empty API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend callback',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transactions with callback 502 (encrypted request, plain response)
   * @param {String} date - YYYY-MM-DD
   */
  getTransactionCallback502: async (date) => {
    try {
      const payload = { date };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionCallback502_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction callback 502 API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load 502 callback transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Resend callbacks for 502 list (not encrypted)
   * @param {Array} ids - array of { id: futuretrxid }
   */
  resendTransactionCallback502: async (ids = []) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(ids));

      const response = await apiClient.post('/transactionCallback502_resendCallback.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resend callback 502 API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to resend 502 callback',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transactions completed today (encrypted)
   * @param {String} transactiontype - optional filter
   */
  getTransactionTodayComplete: async (transactiontype = '') => {
    try {
      const payload = { transactiontype };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionTodayComplete.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction today complete API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load today completed transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get suspected transactions (not encrypted)
   */
  getSuspectedTransactions: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/suspectedTransaction_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Suspected transactions API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load suspected transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Process suspected transaction (approve/send back) (encrypted)
   * @param {String} id - futuretrxid
   */
  processSuspectedTransaction: async (id) => {
    try {
      const payload = { id };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/suspectedTransaction_process.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Process suspected transaction API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process suspected transaction',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get submitted transactions (encrypted)
   * @param {String} transactiontype
   */
  getSubmittedTransactions: async (transactiontype = '') => {
    try {
      const payload = { transactiontype };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/submittedTransaction_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Submitted transactions API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load submitted transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get pending transactions (encrypted)
   * @param {String} transactiontype
   */
  getPendingTransactions: async (transactiontype = '') => {
    try {
      const payload = { transactiontype };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionPending_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Pending transactions API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load pending transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Transaction Flag M list (encrypted)
   * @param {Object} params - { accountno, bank }
   */
  getTransactionFlagM: async ({ accountno = '0', bank = '' } = {}) => {
    try {
      const payload = { accountno, bank };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionFlagM.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transaction Flag M API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load Transaction Flag M data',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get transactions by Not Match Sameday (encrypted)
   * @param {Object} params - { datefrom, dateto }
   */
  getTransactionNotMatchSameday: async ({ datefrom, dateto }) => {
    try {
      const payload = { datefrom, dateto };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionByNotMatchSameday.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Not Match Sameday API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load not-match-sameday transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get resubmit transaction list (encrypted)
   * @param {Object} filter - { type, amount }
   */
  getResubmitTransactionList: async (filter = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(filter);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/resubmitTransaction_getList.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit transaction list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resubmit transaction list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Submit selected resubmit transactions (encrypted)
   * @param {Object} payload - includes filterUsed and list (selected rows)
   */
  submitResubmitTransactions: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/resubmitTransaction_submit.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit transaction submit API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit resubmit transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get resubmit transaction log list
   * @param {Object} filter - { trxid }
   */
  getResubmitTransactionLogs: async (filter = {}) => {
    try {
      const formData = new URLSearchParams();
      Object.entries(filter || {}).forEach(([key, value]) => {
        formData.append(`data[${key}]`, value ?? '');
      });

      const response = await apiClient.post('/resubmitLog_getList.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit transaction log list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resubmit transaction log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get resubmit transaction log detail
   * @param {String|Number} id
   */
  getResubmitTransactionLogDetail: async (id) => {
    try {
      const payload = { id };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/resubmitLogDetail_getList.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit transaction log detail API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resubmit transaction log detail',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get resubmit auto matching list (encrypted)
   * @param {Object} filter - { type, amount }
   */
  getResubmitAutoMatchingList: async (filter = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(filter);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/resubmitAutoMatching_getList.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit auto matching list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resubmit auto matching list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Submit selected auto matching rows (encrypted)
   * @param {Object} payload - { type, amount, list }
   */
  submitResubmitAutoMatching: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/resubmitAutoMatching_submit.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Resubmit auto matching submit API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit resubmit auto matching',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update transaction status (encrypted)
   * @param {Object} payload - { notes3, chgAmt, chgChk, amount, status, pass }
   */
  updateTransactionStatus: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/updateTransactionStatus.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update transaction status API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update transaction status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update transaction status (new) - encrypted
   * @param {Object} payload - { transId, history, chgAmt, chgChk, amount, status, notes3, transactionid }
   */
  updateTransactionStatusNew: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/updateTransactionStatusNew.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update transaction status new API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update transaction status (new)',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update Notes3 by futuretrxid (encrypted)
   * @param {Object} payload - { id, notes, history }
   */
  updateTransactionNotesById: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionUpdateNotesById.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update notes by id API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update notes',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update Notes2 by futuretrxid (encrypted)
   * @param {Object} payload - { id, notes, history }
   */
  updateTransactionNotes2ById: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/transactionUpdateNotes2ById.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update notes2 by id API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update notes2',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get update transaction log list (encrypted)
   * @param {Object} payload - { date }
   */
  getUpdateTransactionLog: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getUpdateTransactionLog.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update transaction log API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load update transaction log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get active MyBank accounts (encrypted response)
   */
  getActiveMyBank: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getActiveMyBank.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Active MyBank API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load active MyBank list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save company adjustment (encrypted)
   * @param {Object} payload - adjustment data
   */
  saveCompanyAdjustment: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/saveCompanyAdjustment.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save company adjustment API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save company adjustment',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get master merchant list (encrypted)
   */
  getMasterMerchant: async () => {
    try {
      const response = await apiClient.post('/getMasterMerchant.php', {});

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Master merchant API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant bank accounts (encrypted)
   * @param {Object} payload - includes merchantCode
   */
  getMasterBankMerchant: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getMasterBankMerchant.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Merchant bank list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant bank list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save company adjustment for merchant (encrypted)
   * @param {Object} payload
   */
  saveCompanyAdjustmentMerchant: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/saveCompanyAdjustmentMerchant.php', formData);

      if (response.data && response.data.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save company adjustment merchant API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save company adjustment merchant',
        details: error.response?.data || null,
      };
    }
  },
};

// Merchant Management API calls
export const merchantAPI = {
  /**
   * Get merchant list
   * Note: This endpoint returns encrypted data
   */
  getMerchantList: async () => {
    return await apiCall('/masterMerchant_getList.php', {});
  },

  /**
   * Get merchant list with account info (encrypted response)
   */
  getMerchantWithAccount: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getMerchantWithAccount.php', formData);

      let payload = response.data;
      if (response.data?.data) {
        payload = CRYPTO.decrypt(response.data.data);
      }

      const records = Array.isArray(payload?.records)
        ? payload.records.map((record) => CRYPTO.decodeRawUrl(record))
        : [];

      return {
        success: true,
        data: {
          ...payload,
          records,
        },
      };
    } catch (error) {
      console.error('Get merchant with account error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant transaction per hour (not encrypted)
   * @param {{ datefrom: string, merchantcode: string }} params
   */
  getMerchantTransactionPerHour: async ({ datefrom, merchantcode }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ datefrom, merchantcode }));

      const response = await apiClient.post('/GetMerchantTransactionPerHour.php', formData);
      const payload = response.data?.data ? CRYPTO.decrypt(response.data.data) : response.data;
      const records = Array.isArray(payload?.records)
        ? payload.records.map((rec) => CRYPTO.decodeRawUrl(rec))
        : [];

      return {
        success: true,
        data: {
          ...payload,
          records,
        },
      };
    } catch (error) {
      console.error('Get merchant transaction per hour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant transaction per hour',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant bank account list (not encrypted)
   * @param {String} merchant - merchant code or 'ALL'
   * @param {Number} isdeleted - 0 or 1 (isNotLinked)
   */
  getMerchantBankAccList: async (merchant = 'ALL', isdeleted = 0) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ merchant, isdeleted }));

      const response = await apiClient.post('/getMerchantBankAccList.php', formData, {
        timeout: 2 * 60 * 1000,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get merchant bank acc list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant bank accounts',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update merchant bank link status for selected rows (not encrypted)
   * @param {String} setUpdate - linked | notLinked
   * @param {Array} items - selected rows
   */
  updateMerchantBankSelected: async (setUpdate, items) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ setUpdate, items }));

      const response = await apiClient.post('/updateMerchantBankSelected.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update merchant bank selected error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update merchant bank selection',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant detail by merchantcode
   * @param {String} merchantcode - Merchant code
   */
  getMerchantDetail: async (merchantcode) => {
    return await apiCall('/getMasterMerchantDetail.php', { merchantcode });
  },

  /**
   * Save merchant (create or update)
   * @param {Object} merchantData - Merchant data
   */
  saveMerchant: async (merchantData) => {
    try {
      const jsonData = CRYPTO.encrypt(merchantData);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/saveMasterMerchant.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save merchant',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Delete merchant
   * @param {String} merchantcode - Merchant code to delete
   */
  deleteMerchant: async (merchantcode) => {
    try {
      const data = { merchantcode };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/deleteMasterMerchant.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete merchant',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get reseller list
   */
  getResellerList: async () => {
    return await apiCall('/getMasterBank2.php', {});
  },

  /**
   * Get country list
   */
  getCountryList: async () => {
    return await apiCall('/getMasterCountry.php', {});
  },

  /**
   * Get currency list
   */
  getCurrencyList: async () => {
    return await apiCall('/getMasterCurrency.php', {});
  },

  /**
   * Get bank list
   */
  getBankList: async () => {
    return await apiCall('/getMasterBank.php', {});
  },

  /**
   * Get merchant bank account list
   * @param {String} merchant - Merchant code or 'ALL'
   */
  getMerchantBankAccList: async (merchant) => {
    try {
      const data = { merchant };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/merchantBankAcc_getList.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);

        // Decode rawurl if records exist
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant transactions by date range
   * @param {String} datefrom - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} dateto - To date (YYYY-MM-DD HH:mm:ss)
   * @param {String} statusValue - Optional status filter ('9'=pending, '0'=accepted, '8'=failed)
   */
  getTransactionByMerchant: async (datefrom, dateto, statusValue = null, transactiontype = null) => {
    try {
      const data = {
        datefrom,
        dateto,
      };

      if (statusValue) {
        data.statusValue = statusValue;
      }
      if (transactiontype) {
        data.transactiontype = transactiontype;
      }
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionByMerchant.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);

        // Decode rawurl if records exist
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant balance (opening balance)
   * @param {String} datefrom - From date (YYYY-MM-DD HH:mm:ss)
   */
  getMerchantBalance: async (datefrom) => {
    try {
      const data = { datefrom };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getMasterMerchantBalance.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant transaction history by date range
   * @param {String} datefrom - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} dateto - To date (YYYY-MM-DD HH:mm:ss)
   * @param {String} statusValue - Optional status filter ('9'=pending, '0'=accepted, '8'=failed)
   */
  getTransactionByMerchantHistory: async (datefrom, dateto, statusValue = null) => {
    try {
      const data = statusValue
        ? { datefrom, dateto, statusValue }
        : { datefrom, dateto };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionByMerchantHistory.php', formData);

      // Decrypt response
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);

        // Decode rawurl if records exist
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant report files
   * @param {String} report - Report type
   * @param {String} category - Category (daily/weekly/monthly)
   * @param {String} merchantCode - Merchant code
   */
  getMerchantReportFiles: async (report, category, merchantCode) => {
    try {
      const data = { report, category, merchantCode };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/report_merchant_getFiles.php', formData, {
        timeout: 2 * 60 * 1000, // 2 minutes timeout
      });

      // Response is not encrypted, but records need url decoding
      if (response.data) {
        const responseData = response.data;

        // Decode rawurl if records exist
        if (responseData.records && Array.isArray(responseData.records)) {
          responseData.records = responseData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }

        return {
          success: true,
          data: responseData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant daily report (complete) - GMT+8
   * @param {String} datefrom - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} dateto - To date (YYYY-MM-DD HH:mm:ss)
   * @param {String} merchant - Merchant code or 'ALL'
   */
  getMerchantDailyReport: async (datefrom, dateto, merchant) => {
    try {
      const data = { datefrom, dateto, merchant };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/admin_reportDaily_complete.php', formData, {
        timeout: 2 * 60 * 1000, // 2 minutes timeout
      });

      // Response is NOT encrypted according to AngularJS code
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant daily report (complete) - GMT+6
   * @param {String} datefrom - From date (YYYY-MM-DD HH:mm:ss)
   * @param {String} dateto - To date (YYYY-MM-DD HH:mm:ss)
   * @param {String} merchant - Merchant code or 'ALL'
   */
  getMerchantDailyReportGMT6: async (datefrom, dateto, merchant) => {
    try {
      const data = { datefrom, dateto, merchant };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/admin_reportDaily_complete_gmt6.php', formData, {
        timeout: 2 * 60 * 1000, // 2 minutes timeout
      });

      // Response is NOT encrypted according to AngularJS code
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent daily complete report - GMT+8
   * @param {String} fromdate - From date (YYYY-MM-DD format)
   * @param {String} todate - To date (YYYY-MM-DD format)
   */
  getAgentDailyComplete: async (fromdate, todate) => {
    try {
      const data = { fromdate, todate };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getAccountReportBetweenCompleteDate.php', formData);

      // Response IS ENCRYPTED according to AngularJS code
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent daily complete report - GMT+6
   * @param {String} fromdate - From date (YYYY-MM-DD format)
   * @param {String} todate - To date (YYYY-MM-DD format)
   */
  getAgentDailyCompleteGMT6: async (fromdate, todate) => {
    try {
      const data = { fromdate, todate };
      const jsonData = CRYPTO.encrypt(data);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getAccountReportBetweenCompleteDate6.php', formData);

      // Response IS ENCRYPTED according to AngularJS code
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant list without demo accounts
   */
  getMerchantListNoDemo: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/masterMerchant_getListNoDemo.php', formData);

      // Response IS ENCRYPTED according to AngularJS code
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent realtime report - GMT+8
   * No parameters needed - returns current day realtime data
   */
  getAgentRealtimeReport: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getAccountReportDailyRealtime.php', formData);

      // Response is NOT encrypted according to AngularJS code
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent realtime report - GMT+6
   * No parameters needed - returns current day realtime data
   */
  getAgentRealtimeReportGMT6: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getAccountReportDailyRealtime6.php', formData);

      // Response is NOT encrypted according to AngularJS code
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Balance Difference report
   * Shows discrepancies between actual and reported transactions
   * @param {String} datefrom - From date with time (e.g., "2024-01-01 00:00:00")
   * @param {String} dateto - To date with time (e.g., "2024-01-01 23:59:59")
   * @param {String} merchant - Merchant code or "ALL"
   */
  getBalanceDifference: async (datefrom, dateto, merchant) => {
    try {
      const data = {
        datefrom,
        dateto,
        merchant,
      };

      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getBalanceDifference.php', formData);

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get SMS Log By Agent Report
   * Shows agent account transactions by SMS (cash in, deposit, B2B transfers)
   * @param {String} date - Date string (e.g., "2024-01-01")
   */
  getSmsLogByAgentReport: async (date) => {
    try {
      const data = { date };

      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getSmsLogByAgentReport.php', formData);

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Report List (types)
   * Gets available report types for download
   */
  getReportList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/report_getReportList.php', formData);

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get Report Files
   * Gets list of available report files for download
   * @param {String} report - Report type
   * @param {String} category - Report category (daily, weekly, monthly)
   * @param {String} merchantCode - Merchant code or "ALL" or "SMS"
   */
  getReportFiles: async (report, category, merchantCode) => {
    try {
      const data = {
        report,
        category,
        merchantCode,
      };

      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/report_getFiles.php', formData, {
        timeout: 2 * 60 * 1000, // 2 minutes timeout
      });

      // Response is NOT encrypted but needs urlDecode
      if (response.data && response.data.records) {
        const records = response.data.records.map((record) =>
          CRYPTO.decodeRawUrl(record)
        );
        return {
          success: true,
          data: {
            ...response.data,
            records,
          },
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  // MCO / Flag Customer Report
  getFlagCustomerList: async (includeBlacklist = 0) => {
    try {
      const data = { includeBlacklist };
      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/report_flagCustomer.php',
        formData
      );

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  blacklistFlagCustomer: async (merchantCode, customerCode) => {
    try {
      const data = { merchantCode, customerCode };
      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/report_flagCustomer_blacklist.php',
        formData
      );

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  // Blacklist List
  getBlacklistList: async () => {
    try {
      const data = { includeBlacklist: 0 };
      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/report_blacklist.php', formData);

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  addBlacklistCustomer: async (merchantCode, customerCode) => {
    try {
      const params = {
        customercode: customerCode,
        merchantcode: merchantCode,
      };
      const formData = new URLSearchParams();
      formData.append('data[customercode]', params.customercode);
      formData.append('data[merchantcode]', params.merchantcode);

      const response = await apiClient.post(
        '/addBlackListCustomerCode.php',
        formData
      );

      // Response is NOT ENCRYPTED
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  deleteBlacklist: async (merchantCode, customerCode) => {
    try {
      const data = { merchantCode, customerCode };
      const jsonData = CRYPTO.encrypt(data);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post(
        '/reportBlacklist_delete.php',
        formData
      );

      // Response IS ENCRYPTED
      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },

  // Summary Bkashm
  getSummaryBkashm: async (datefrom, dateto) => {
    try {
      const response = await apiClient.post(
        '/getSummaryBkashm.php',
        {
          data: {
            datefrom,
            dateto,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Response is NOT ENCRYPTED
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred',
        details: error.response?.data || null,
      };
    }
  },
};

// Withdraw Dashboard API calls
export const withdrawAPI = {
  /**
   * Get withdraw dashboard summary (not encrypted)
   */
  getDashboardMetrics: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}'); // send non-empty payload to match PHP expectations

      const response = await apiClient.post('/withdrawDashboard.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw dashboard API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw dashboard',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get withdraw list (encrypted request)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   */
  getList: async (datefrom, dateto) => {
    try {
      const payload = { datefrom: `${datefrom} 00:00:00`, dateto: `${dateto} 23:59:59` };
      const jsonData = CRYPTO.encrypt(payload);

      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getWithdrawList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get automation withdraw list (encrypted request, plain response)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   * @param {Boolean} history - Include history data
   */
  getAutomationList: async (datefrom, dateto, history = false) => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
        history,
      };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getAutomationWithdrawList.php', formData);
      const payloadData = response.data;

      if (payloadData && payloadData.data) {
        // In case backend returns encrypted data, decrypt it
        const decrypted = CRYPTO.decrypt(payloadData.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      if (payloadData && payloadData.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Automation withdraw list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load automation withdraw list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get automation withdraw transactions (appium withdraw transaction new)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   * @param {String} status - status filter
   * @param {String} agent - account filter
   */
  getAutomationTransactions: async (datefrom, dateto, status, agent = '') => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
        status,
        agent,
      };

      const response = await apiClient.post(
        '/appiumWithdrawTransactionNew2.php',
        { data: payload },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const payloadData = response.data;

      if (payloadData && payloadData.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Automation withdraw transaction API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load automation withdraw transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get withdraw need-to-check list (encrypted)
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {String} params.hourfrom - HH:mm
   * @param {String} params.hourto - HH:mm
   * @param {Array<String>|String} params.merchant - merchant code(s) or 'all'
   * @param {Boolean} params.history - include history
   */
  getWithdrawNtc: async ({
    datefrom,
    dateto,
    hourfrom,
    hourto,
    merchant = 'all',
    history = false,
  }) => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
        hourfrom,
        hourto,
        merchant: Array.isArray(merchant) ? merchant.join(',') : merchant,
        history,
      };

      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getWithdrawNtc.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw NTC list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw need-to-check list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get automation withdraw need-to-check list (encrypted)
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {String} params.hourfrom - HH:mm
   * @param {String} params.hourto - HH:mm
   * @param {Array<String>|String} params.merchant - merchant code(s) or 'all'
   * @param {Boolean} params.history - include history
   */
  getAutomationWithdrawNtc: async ({
    datefrom,
    dateto,
    hourfrom,
    hourto,
    merchant = 'all',
    history = false,
  }) => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
        hourfrom,
        hourto,
        merchant: Array.isArray(merchant) ? merchant.join(',') : merchant,
        history,
      };

      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/automationGetWithdrawNtc.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Automation withdraw NTC list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load automation withdraw need-to-check list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get withdraw check filter list (encrypted)
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {String} params.hourfrom - HH:mm
   * @param {String} params.hourto - HH:mm
   * @param {Array<String>|String} params.merchant - merchant code(s) or 'all'
   * @param {Boolean} params.history - include history
   * @param {String} params.filter - status filter
   */
  getWithdrawNtcFilter: async ({
    datefrom,
    dateto,
    hourfrom,
    hourto,
    merchant = 'all',
    history = false,
    filter = 'pending',
    bankCode = '',
  }) => {
    try {
      // PHP expects merchant as array of objects with id, or string 'all'
      const merchantPayload =
        merchant === 'all'
          ? 'all'
          : (Array.isArray(merchant) ? merchant : [merchant]).map((m) =>
              typeof m === 'string' ? { id: m } : m
            );

      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
        hourfrom,
        hourto,
        merchant: merchantPayload,
        history,
        filter,
        bankCode,
      };

      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/withdrawNtcFilter.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw NTC filter list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw check filter list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get allowed withdraw banks (encrypted)
   */
  getWithdrawBanks: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getWithdrawBank.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw bank list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw banks',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Set withdraw bank status (encrypted)
   * @param {Number|String} id - bank record id
   * @param {String} status - 'Y' or 'N'
   */
  setWithdrawBankStatus: async (id, status) => {
    try {
      const jsonData = CRYPTO.encrypt({ id, status });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/setWithdrawBankStatus.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw bank status API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update withdraw bank status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get withdraw assignment list (encrypted)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   */
  getWithdrawAssignments: async (datefrom, dateto) => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
      };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/withdrawAssignment_list.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw assignment list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw assignments',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get assignment pending list (encrypted)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   */
  getWithdrawAssignmentPending: async (datefrom, dateto) => {
    try {
      const payload = {
        datefrom: `${datefrom} 00:00:00`,
        dateto: `${dateto} 23:59:59`,
      };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/assignmentPending_list.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw assignment pending list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load assignment pending list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get withdraw queue (encrypted)
   */
  getWithdrawQueue: async () => {
    try {
      const jsonData = CRYPTO.encrypt({ data: '' });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getWithdrawQueue.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw queue list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load withdraw queue',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Assign/reassign withdraw (encrypted)
   * @param {Object} params - { id, accountNo, bankCode, accountName, username }
   */
  assignWithdraw: async ({ id, accountNo, bankCode, accountName, username }) => {
    try {
      const jsonData = CRYPTO.encrypt({ id, accountNo, bankCode, accountName, username });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/withdrawAssignment_assign.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw assign API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to assign withdraw',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant withdrawal transactions (encrypted)
   * @param {String} datefrom - YYYY-MM-DD
   * @param {String} dateto - YYYY-MM-DD
   * @param {String} transactiontype - 'W' for withdraw
   * @param {String} statusValue - optional status filter
   */
  getMerchantWithdrawalTransactions: async (
    datefrom,
    dateto,
    transactiontype = 'W',
    statusValue = ''
  ) => {
    try {
      const payload = { datefrom: `${datefrom} 00:00:00`, dateto: `${dateto} 23:59:59`, transactiontype };
      if (statusValue) {
        payload.statusValue = statusValue;
      }
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getTransactionByMerchant.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            Object.entries(record || {}).reduce((acc, [key, value]) => {
              if (typeof value === 'string') {
                try {
                  acc[key] = decodeURIComponent(value);
                } catch (_) {
                  acc[key] = value;
                }
              } else {
                acc[key] = value;
              }
              return acc;
            }, {})
          );
        }

        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Merchant withdrawal transactions API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant withdrawal transactions',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get merchant balance (encrypted)
   * @param {String} datefrom - YYYY-MM-DD
   */
  getMerchantBalance: async (datefrom) => {
    try {
      const payload = { datefrom: `${datefrom} 00:00:00` };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getMasterMerchantBalance.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Merchant balance API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchant balance',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Mark withdraw as success with upload/assignment (not encrypted)
   * @param {Object} params - { id, account, bankcode, receipt }
   */
  setWithdrawSuccessWithReceipt: async ({ id, account, bankcode, receipt }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data[id]', id);
      formData.append('data[account]', account);
      formData.append('data[bankcode]', bankcode);
      formData.append('data[receipt]', receipt || '');

      const response = await apiClient.post(
        '/changeStatusSuccessTransactionAccountByCompanyEncrypt.php',
        formData
      );

      // this endpoint is NOT encrypted in legacy bulk flow
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Withdraw success with receipt API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update withdraw status',
        details: error.response?.data || null,
      };
    }
  },
};

// Crawler / Appium API calls
export const crawlerAPI = {
  /**
   * Get crawler (appium) list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {Boolean} params.history - include history
   */
  getAppiumList: async ({ datefrom, dateto, history = false }) => {
    try {
      const payload = {
        data: {
          datefrom: `${datefrom} 00:00:00`,
          dateto: `${dateto} 23:59:59`,
          history,
        },
      };

      const response = await apiClient.post('/appiumList_getList.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const payloadData = response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Appium list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load appium list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get crawler (appium) not match list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {Boolean} params.history - include history
   */
  getAppiumListNotMatch: async ({ datefrom, dateto, history = false }) => {
    try {
      const payload = {
        data: {
          datefrom: `${datefrom} 00:00:00`,
          dateto: `${dateto} 23:59:59`,
          history,
        },
      };

      const response = await apiClient.post('/appiumList_getListNotMatch.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const payloadData = response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Appium not match list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load appium not match list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get appium withdraw queue list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   */
  getWithdrawQueue: async ({ datefrom, dateto }) => {
    try {
      const payload = {
        data: {
          datefrom: `${datefrom} 00:00:00`,
          dateto: `${dateto} 23:59:59`,
        },
      };

      const response = await apiClient.post('/appiumWithdrawQueue_getList.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Backend sometimes wraps payload in `data`
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Appium withdraw queue API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load appium withdraw queue',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get account appium status (new)
   */
  getAccountStatusNew: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/accountAppiumStatusNew_getList.php', formData);
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Account appium status new API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load account status',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get appium error log list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   */
  getErrorLog: async ({ datefrom, dateto }) => {
    try {
      const payload = {
        data: {
          datefrom: `${datefrom} 00:00:00`,
          dateto: `${dateto} 23:59:59`,
        },
      };

      const response = await apiClient.post('/appiumErrorLog_getList.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Appium error log API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load appium error log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get list agent failed summary
   * @param {Object} params
   * @param {String} params.date - YYYY-MM-DD
   * @param {String} params.type - phase/type flag
   */
  getAgentFailedSummary: async ({ date, type }) => {
    try {
      const payload = { data: { date, type } };
      const response = await apiClient.post('/getfailedsummary.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Agent failed summary API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agent failed summary',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Recrawl a single account
   * @param {String} accountNo
   */
  recrawlAccount: async (accountNo) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data[accountNo]', accountNo);

      const response = await apiClient.post('/setCrawlSummary.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Recrawl account API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to recrawl account',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Recrawl bulk accounts (encrypted)
   * @param {Array<{account: string, bank: string, user: string}>} items
   * @param {String} groupname
   */
  recrawlBulkAccounts: async (items = [], groupname = 'defaultGroup') => {
    try {
      const jsonData = CRYPTO.encrypt({ groupname, items });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/setCrawlSummaryBulk.php', formData);

      if (response.data?.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Recrawl bulk accounts API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to recrawl accounts',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Mark error on selected accounts (encrypted)
   * @param {Array<{account: string, bank: string, user: string}>} items
   * @param {String} groupname
   */
  markAccountsError: async (items = [], groupname = '') => {
    try {
      const jsonData = CRYPTO.encrypt({ groupname, items });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/markerror.php', formData);

      if (response.data?.data) {
        const decrypted = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decrypted,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Mark error accounts API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark accounts as error',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get account balance log
   * @param {Object} params
   * @param {String} params.date - YYYY-MM-DD
   * @param {String} params.type - phase flag (1,2,3)
   */
  getAccountBalanceLog: async ({ date, type }) => {
    try {
      const payload = { data: { date, type } };
      const response = await apiClient.post('/getAccountBalanceLog.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Account balance log API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load account balance log',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent summary report
   * @param {String} date - YYYY-MM-DD
   */
  getAgentSummary: async (date) => {
    try {
      const payload = { data: { date } };
      const response = await apiClient.post('/agentSummary_report.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Agent summary API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agent summary',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get monthly summary report
   * @param {String} date - YYYY-MM-DD (use first day of month)
   */
  getMonthlySummary: async (date) => {
    try {
      const payload = { data: { date } };
      const response = await apiClient.post('/monthlySummary_list.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Monthly summary API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load monthly summary',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get report difference
   * @param {String} date - YYYY-MM-DD
   */
  getReportDifference: async (date) => {
    try {
      const payload = { data: { date } };
      const response = await apiClient.post('/reportDifference_list.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Report difference API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load report difference',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get credentials BKASHM (service list)
   */
  getCredentialsBkashm: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/GetServiceList.php', formData);

      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Credentials BKASHM API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load credentials',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get settlement & topup (request manual) list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {String} params.accountno
   */
  getSettlementTopup: async ({ datefrom, dateto, accountno = '0' }) => {
    try {
      const payload = { datefrom: `${datefrom} 00:00:00`, dateto: `${dateto} 23:59:59`, accountno };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getRequestManual.php', formData);

      const encrypted = response.data?.data;
      let payloadData = response.data;

      if (encrypted) {
        payloadData = CRYPTO.decrypt(encrypted);
      }

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Settlement & topup list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load settlement & topup list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get request list (settlement/topup)
   */
  getRequestList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/getRequestList.php', formData);

      const encrypted = response.data?.data;
      let payloadData = response.data;

      if (encrypted) {
        payloadData = CRYPTO.decrypt(encrypted);
      }

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Request list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load request list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get B2B send list
   * @param {Object} params
   * @param {String} params.datefrom - YYYY-MM-DD
   * @param {String} params.dateto - YYYY-MM-DD
   * @param {String} params.accountno
   */
  getB2bSendList: async ({ datefrom, dateto, accountno = '0' }) => {
    try {
      const payload = { datefrom: `${datefrom} 00:00:00`, dateto: `${dateto} 23:59:59`, accountno };
      const response = await apiClient.post('/getAgent.php', { data: payload }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('B2B send list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load B2B send list',
        details: error.response?.data || null,
      };
    }
  },
};

// CP Journal API calls
export const cpJournalAPI = {
  /**
   * Get CP journal list by date
   * @param {String} filterDate - YYYY-MM-DD
   */
  getList: async (filterDate) => {
    try {
      const payload = { filterdate: `${filterDate} 00:00:00` };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/getCPJournal.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('CP Journal API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load CP journal',
        details: error.response?.data || null,
      };
    }
  },
};

// Available Account API calls
export const availableAccountAPI = {
  /**
   * Get available account list (not encrypted)
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/AvailableAccountList.php', formData);
      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Available account list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load available account list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update use flag for an account (encrypted payload)
   * @param {Object} payload - Account data plus { isUsed }
   */
  updateUse: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/UpdateAvailableAccountUse.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update available account use error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update account use',
        details: error.response?.data || null,
      };
    }
  },
};

// Whitelist Merchant IP API calls
export const whitelistMerchantIpAPI = {
  /**
   * Get whitelist merchant IP list (encrypted response)
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/whitelistMerchantIp_getList.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Whitelist merchant IP list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load whitelist merchant IP list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get whitelist merchant IP detail (encrypted response)
   * @param {Number|String} id
   */
  getDetail: async (id) => {
    try {
      const payload = { id };
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/whitelistMerchantIpForm_getData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        if (decryptedData.records && Array.isArray(decryptedData.records)) {
          decryptedData.records = decryptedData.records.map((record) =>
            CRYPTO.decodeRawUrl(record)
          );
        }
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Whitelist merchant IP detail error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load whitelist merchant IP detail',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save whitelist merchant IP (encrypted payload)
   * @param {Object} payload - { id, merchantCode, ip }
   */
  save: async (payload) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/whitelistMerchantIpForm_saveData.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Whitelist merchant IP save error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save whitelist merchant IP',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Delete whitelist merchant IP (encrypted payload)
   * @param {Number|String} id
   */
  delete: async (id) => {
    try {
      const jsonData = CRYPTO.encrypt({ id });
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/whitelistMerchantIp_delete.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Whitelist merchant IP delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete whitelist merchant IP',
        details: error.response?.data || null,
      };
    }
  },
};

// Available Account New Deposit API calls
export const availableAccountNewAPI = {
  /**
   * Get available account new list (not encrypted)
   */
  getList: async () => {
    try {
      const response = await apiClient.post('/availableAccountNew.php', {});
      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Available account new list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load available account new list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update selected accounts to a group (encrypted)
   * @param {Object} payload - { group, list: [] }
   */
  updateSelected: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/updateAvailableAccountSelected.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update selected available account error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update selected accounts',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update group for a single account (plain payload)
   * @param {Object} payload - { groupid, bankCode, merchant, user }
   */
  updateSingleGroup: async (payload = {}) => {
    try {
      const response = await apiClient.post('/updateGroupAvailableAccountNew.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update group (single) error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update group',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Rerun available account new process (plain payload)
   */
  rerun: async () => {
    try {
      const response = await apiClient.post('/availableAccountNew_rerun.php', {});
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Available account new rerun error:', error);
      return {
        success: false,
        error: error.message || 'Failed to rerun',
        details: error.response?.data || null,
      };
    }
  },
};

// Available Account with Mybank (New Deposit) API calls
export const availableAccountMybankAPI = {
  /**
   * Get available account with mybank list (not encrypted)
   * @param {String} group - A | D | W
   */
  getList: async (group = 'A') => {
    try {
      const payload = { data: { group } };
      const response = await apiClient.post('/getAvailableAccount.php', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      });
      const payloadData = response.data ?? {};
      const records = Array.isArray(payloadData.records) ? payloadData.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payloadData,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Available account mybank list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load available account mybank list',
        details: error.response?.data || null,
      };
    }
  },
};

// Count Available Account New (with Mybank) API calls
export const countAvailableAccountAPI = {
  /**
   * Get count available account new list (not encrypted)
   */
  getList: async () => {
    try {
      const response = await apiClient.post('/countavailableAccountNew.php', {});
      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Count available account list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load count available account list',
        details: error.response?.data || null,
      };
    }
  },
};

// Available Account New Withdraw API calls
export const availableAccountNewWdAPI = {
  /**
   * Get available account new withdraw list (not encrypted)
   */
  getList: async () => {
    try {
      const response = await apiClient.post('/availableAccountNewWd.php', {});
      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Available account new withdraw list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load available account new withdraw list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update selected accounts (encrypted)
   * @param {Object} payload - { group, list: [] }
   */
  updateSelected: async (payload = {}) => {
    try {
      const jsonData = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', jsonData);

      const response = await apiClient.post('/updateAvailableAccountSelectedWd.php', formData);

      if (response.data && response.data.data) {
        const decryptedData = CRYPTO.decrypt(response.data.data);
        return {
          success: true,
          data: decryptedData,
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update selected available account withdraw error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update selected accounts',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Update group for a single account (plain payload)
   * @param {Object} payload - { groupid, bankCode, merchant, user }
   */
  updateSingleGroup: async (payload = {}) => {
    try {
      const response = await apiClient.post('/updateGroupAvailableAccountNewWd.php', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update group withdraw (single) error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update group',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Rerun available account new withdraw process (plain payload)
   */
  rerun: async () => {
    try {
      const response = await apiClient.post('/availableAccountNewWd_rerun.php', {});
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Available account new withdraw rerun error:', error);
      return {
        success: false,
        error: error.message || 'Failed to rerun',
        details: error.response?.data || null,
      };
    }
  },
};

// Service Selenium list / execution
export const serviceAutomationAPI = {
  /**
   * Get service list (GetServiceList.php)
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/GetServiceList.php', formData);
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Service list API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load service list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Execute service python (restart/start/stop)
   * @param {Object} payload - { statment, servicename, server }
   */
  execute: async (payload = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/executeServicePython.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Execute service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute service',
        details: error.response?.data || null,
      };
    }
  },
};

// Service Nagad API list / execution
export const serviceNagadAPI = {
  /**
   * Get Nagad API service list
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/GetServiceNagadAPI.php', formData);
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Service Nagad list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load Nagad services',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Execute Nagad service (restart/start/stop)
   * @param {Object} payload - { statment, servicename }
   */
  execute: async (payload = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/executeServiceNagadAPI.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Execute Nagad service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute Nagad service',
        details: error.response?.data || null,
      };
    }
  },
};

// Service Bkash API list / execution
export const serviceBkashAPI = {
  /**
   * Get Bkash API service list
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/GetServiceBkashAPI.php', formData);
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Service Bkash list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load Bkash services',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Execute Bkash service (restart/start/stop)
   * @param {Object} payload - { statment, servicename }
   */
  execute: async (payload = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(payload));

      const response = await apiClient.post('/executeServiceBkashAPI.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Execute Bkash service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute Bkash service',
        details: error.response?.data || null,
      };
    }
  },
};

// Service Resend Callback list / execution
export const serviceResendCallbackAPI = {
  /**
   * Get resend callback service list
   */
  getList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/GetResendCallbackServiceList.php', formData);
      const payloadData = response.data?.data ?? response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData.records = payloadData.records.map((record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch (_) {
                acc[key] = value;
              }
            } else {
              acc[key] = value;
            }
            return acc;
          }, {})
        );
      }

      return {
        success: true,
        data: payloadData,
      };
    } catch (error) {
      console.error('Resend callback service list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resend callback services',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Execute resend callback service
   * @param {Number|String} id
   */
  execute: async (id) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ id }));

      const response = await apiClient.post('/executeResendCallbackServicePython.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Execute resend callback error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute resend callback',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Add resend callback batch
   */
  addResendCallback: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '{}');

      const response = await apiClient.post('/addResendCallback.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Add resend callback error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add resend callback',
        details: error.response?.data || null,
      };
    }
  },
};

// Agent Tracker API calls
export const agentTrackerAPI = {
  /**
   * Get dashboard stats
   */
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/AgentTrackerAPI.php', {
        params: { action: 'dashboard' },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Agent tracker dashboard error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agent tracker dashboard',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agents list (optional bankcode filter)
   */
  getAgents: async (bankcode) => {
    try {
      const params = { action: 'agents' };
      if (bankcode) params.bankcode = bankcode;

      const response = await apiClient.get('/AgentTrackerAPI.php', { params });
      const payload = response.data ?? {};
      const recordsObj = payload.data?.agents || {};
      const agents = Array.isArray(recordsObj)
        ? recordsObj
        : Object.values(recordsObj || {});

      const normalized = agents.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
          lastUpdate: payload.data?.lastUpdate,
        },
      };
    } catch (error) {
      console.error('Agent tracker list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agent tracker list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get agent detail
   */
  getDetail: async ({ bankcode, accountNo }) => {
    try {
      const response = await apiClient.get('/AgentTrackerAPI.php', {
        params: { action: 'detail', bankcode, accountNo },
      });
      const payload = response.data ?? {};
      const record = payload.data?.agent || {};
      const normalized = Object.entries(record).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          try {
            acc[key] = decodeURIComponent(value);
          } catch (_) {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});

      return {
        success: true,
        data: { ...payload, agent: normalized },
      };
    } catch (error) {
      console.error('Agent tracker detail error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load agent detail',
        details: error.response?.data || null,
      };
    }
  },
};

// Merchant Dashboard API calls
export const merchantDashboardAPI = {
  /**
   * Get merchant list (decrypt response)
   */
  getMerchantList: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/masterMerchant_getList.php', formData);
      const payload = response.data ?? {};
      let records = [];

      if (payload.data) {
        const decrypted = CRYPTO.decrypt(payload.data);
        const list = decrypted?.records || decrypted?.data || [];
        records = Array.isArray(list) ? list : [];
      } else if (Array.isArray(payload.records)) {
        records = payload.records;
      }

      const normalized = records.map((record) => CRYPTO.decodeRawUrl(record));
      const withAll = [...normalized];
      if (!withAll.some((item) => (item?.merchantcode || '').toUpperCase() === 'ALL')) {
        withAll.push({ merchantcode: 'ALL' });
      }

      return {
        success: true,
        data: {
          ...payload,
          records: withAll,
          data: withAll,
        },
      };
    } catch (error) {
      console.error('Merchant list fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load merchants',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get dashboard summary per merchant (encrypted request)
   * @param {Object} params - { dateFrom, dateTo, merchantCode }
   */
  getSummary: async ({ dateFrom, dateTo, merchantCode = 'ALL' }) => {
    try {
      const payload = {
        datefrom: dateFrom,
        dateto: dateTo,
        merchantcode: merchantCode || 'ALL',
      };
      const encrypted = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', encrypted);

      const response = await apiClient.post('/getDashboardMerchant.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Merchant dashboard fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load dashboard data',
        details: error.response?.data || null,
      };
    }
  },
};

// Emergency Deposit API calls
export const emergencyDepositAPI = {
  /**
   * Get emergency deposit list (not encrypted)
   * @param {Object} params - { dateFrom, dateTo }
   */
  getList: async ({ dateFrom, dateTo }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ dateFrom, dateTo }));

      const response = await apiClient.post('/emergency_deposit_getList.php', formData);
      const payload = response.data ?? {};
      const records = Array.isArray(payload.records) ? payload.records : [];
      const normalized = records.map((record) =>
        Object.entries(record || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          records: normalized,
        },
      };
    } catch (error) {
      console.error('Emergency deposit list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load emergency deposit list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Trigger emergency deposit process (not encrypted)
   * @param {Object} params - { dateFrom, dateTo }
   */
  runEmergency: async ({ dateFrom, dateTo }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify({ dateFrom, dateTo }));

      const response = await apiClient.post('/Emergencydeposit.php', formData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Emergency deposit run error:', error);
      return {
        success: false,
        error: error.message || 'Failed to run emergency deposit',
        details: error.response?.data || null,
      };
    }
  },
};

// System Setting API calls
export const systemAPI = {
  /**
   * Get system settings list (not encrypted)
   */
  getSettings: async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', '');

      const response = await apiClient.post('/system_getSetting.php', formData);
      const payload = response.data ?? {};
      const rawList = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.records)
          ? payload.records
          : [];

      const settings = rawList.map((item) =>
        Object.entries(item || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            try {
              acc[key] = decodeURIComponent(value);
            } catch (_) {
              acc[key] = value;
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {})
      );

      return {
        success: true,
        data: {
          ...payload,
          data: settings,
          records: settings,
        },
      };
    } catch (error) {
      console.error('System settings fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load system settings',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Save system settings (encrypted)
   * @param {Array} settings - Array of system setting objects
   */
  saveSettings: async (settings = []) => {
    try {
      const encryptedPayload = CRYPTO.encrypt(settings);
      const formData = new URLSearchParams();
      formData.append('data', encryptedPayload);

      const response = await apiClient.post('/system_saveSetting.php', formData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('System settings save error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save system settings',
        details: error.response?.data || null,
      };
    }
  },
};

/**
 * Resubmit Express API calls
 */
export const resubmitExpressAPI = {
  /**
   * Get resubmit express list
   * @param {{type?: string|number, amount?: number}} filter
   */
  getList: async (filter = {}) => {
    const decodeSafe = (value) => {
      if (typeof value !== 'string') return value ?? '';
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };

    try {
      const payload = {
        type: filter.type ?? '2',
        amount: filter.amount ?? 1000,
      };
      const encrypted = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', encrypted);

      const response = await apiClient.post('/resubmitExpress_getList.php', formData);
      let payloadData = response.data?.data ? CRYPTO.decrypt(response.data.data) : response.data;

      if (payloadData?.records && Array.isArray(payloadData.records)) {
        payloadData = {
          ...payloadData,
          records: payloadData.records.map((rec) => ({
            ...rec,
            message: decodeSafe(rec.message),
            from: decodeSafe(rec.from),
          })),
        };
      }

      return { success: true, data: payloadData };
    } catch (error) {
      console.error('Get resubmit express list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load resubmit express list',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Submit selected resubmit express items
   * @param {Object} payload - typically { type, amount, list }
   */
  submit: async (payload = {}) => {
    try {
      const encrypted = CRYPTO.encrypt(payload);
      const formData = new URLSearchParams();
      formData.append('data', encrypted);

      const response = await apiClient.post('/resubmitExpress_submit.php', formData);
      const payloadData = response.data?.data ? CRYPTO.decrypt(response.data.data) : response.data;

      return { success: true, data: payloadData };
    } catch (error) {
      console.error('Submit resubmit express error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit resubmit express',
        details: error.response?.data || null,
      };
    }
  },
};

/**
 * Report Resubmit Without Automation API calls
 */
export const reportResubmitAPI = {
  /**
   * Get report resubmit without automation list
   * @param {{from: string, to: string}} params
   */
  getWithoutAutomationList: async (params = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(params));

      const response = await apiClient.post('/reportResubmitWithoutAutomation_getList.php', formData);
      const payload = response.data?.data ? response.data.data : response.data;

      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      console.error('Report resubmit without automation list error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load report resubmit without automation',
        details: error.response?.data || null,
      };
    }
  },

  /**
   * Get report resubmit without automation summary list
   * @param {{from: string, to: string}} params
   */
  getWithoutAutomationSummary: async (params = {}) => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', JSON.stringify(params));

      const response = await apiClient.post(
        '/reportResubmitWithoutAutomationSummary_getList.php',
        formData
      );
      const payload = response.data?.data ? response.data.data : response.data;

      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      console.error('Report resubmit without automation summary error:', error);
      return {
        success: false,
        error: error.message || 'Failed to load report resubmit without automation summary',
        details: error.response?.data || null,
      };
    }
  },
};

// Export default API client for custom calls
export default apiClient;

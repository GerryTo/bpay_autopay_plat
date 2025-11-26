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
      formData.append('data', 'get');

      const response = await apiClient.post('/serverList_getList.php', formData);

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

// Export default API client for custom calls
export default apiClient;

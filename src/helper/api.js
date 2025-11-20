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

// Export default API client for custom calls
export default apiClient;

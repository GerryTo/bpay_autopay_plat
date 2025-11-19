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
};

// Export default API client for custom calls
export default apiClient;

import { AesCtr } from './aes-ctr';
import { PRIVATE_KEY } from '../config/encryption';

/**
 * Crypto utility for encrypting and decrypting data
 * Compatible with PHP CryptoAES encryption (AES-CTR mode)
 * Based on Chris Veness AES implementation (aes.js, aes-ctr.js)
 */

/**
 * Generate random key of specified length
 * @param {Number} length - Length of key
 * @returns {String} - Random key string
 */
const generateRandomKey = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CRYPTO = {
  /**
   * Encrypt data before sending to server
   * Format: publicKey16chars + encryptedCipher
   * Same as PHP: $Public_Key = getRandomKey(16); $chiper = CryptoAES::encrypt($data, $Public_Key . $Private_Key, 256);
   * @param {Object|String} data - Data to encrypt
   * @returns {String} - Encrypted string (publicKey + cipher)
   */
  encrypt: (data) => {
    try {
      // Convert data to JSON string
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

      // Generate random 16-character public key
      const publicKey = generateRandomKey(16);

      // Combine public key with private key
      const fullKey = publicKey + PRIVATE_KEY;

      // Encrypt using AES-CTR mode (same as PHP CryptoAES)
      const encryptedCipher = AesCtr.encrypt(jsonString, fullKey, 256);

      // Return format: publicKey + encryptedCipher
      return publicKey + encryptedCipher;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  },

  /**
   * Decrypt data received from server (AES-CTR compatible)
   * Expected format from PHP: "16charPublicKey" + "encryptedCipher"
   *
   * PHP encryption logic (using Aes.Ctr):
   * var publicKey = this.generateKey(); // 16 random characters
   * var enc = Aes.Ctr.encrypt(JSON.stringify(data), publicKey + this.privateKey, 256);
   * return publicKey + enc;
   *
   * @param {String} encryptedData - Encrypted data string (publicKey + cipher)
   * @returns {Object} - Decrypted data object
   */
  decrypt: (encryptedData) => {
    try {
      if (!encryptedData || encryptedData.length < 16) {
        throw new Error('Invalid encrypted data format');
      }

      // Extract the public key (first 16 characters)
      const publicKey = encryptedData.substring(0, 16);

      // Extract the encrypted cipher (remaining characters after public key)
      const cipher = encryptedData.substring(16);

      // Combine public key with private key to form the full decryption key
      const fullKey = publicKey + PRIVATE_KEY;

      console.log('AES-CTR Decryption attempt:', {
        publicKey,
        cipherLength: cipher.length,
        fullKeyLength: fullKey.length,
      });

      // Decrypt using AES-CTR mode (compatible with PHP Aes.Ctr)
      const decryptedString = AesCtr.decrypt(cipher, fullKey, 256);

      if (!decryptedString) {
        throw new Error('Decryption failed - empty result');
      }

      // Parse JSON
      const parsedData = JSON.parse(decryptedString);
      console.log('AES-CTR Decryption successful!');

      return parsedData;
    } catch (error) {
      console.error('Decryption error:', error);
      console.error('Encrypted data length:', encryptedData?.length);
      console.error('First 16 chars (public key):', encryptedData?.substring(0, 16));

      // If decryption fails, try to return as-is (might be unencrypted response)
      try {
        return JSON.parse(encryptedData);
      } catch {
        // Return error object
        return {
          status: 'error',
          message: 'Failed to decrypt data',
          error: error.message,
        };
      }
    }
  },

  /**
   * Decode rawurlencoded data from PHP
   * @param {Object} data - Object with rawurlencoded values
   * @returns {Object} - Object with decoded values
   */
  decodeRawUrl: (data) => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const decoded = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // Decode rawurlencoded strings
        decoded[key] = typeof data[key] === 'string' ? decodeURIComponent(data[key]) : data[key];
      }
    }
    return decoded;
  },
};

export default CRYPTO;

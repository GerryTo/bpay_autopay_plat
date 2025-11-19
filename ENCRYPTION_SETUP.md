# Encryption Setup Guide

## CryptoAES Integration with Existing PHP Backend

This guide explains how to set up the CryptoAES encryption/decryption to work with your existing getMasterLogin.php endpoint.

---

## Files Updated

1. **src/helper/crypto.js** - CryptoAES-compatible decryption using crypto-js
2. **src/helper/api.js** - Updated to handle encrypted responses
3. **src/config/encryption.js** - Configuration file for Private Key
4. **src/layouts/userManagement/accountList.jsx** - Simplified data handling

---

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install crypto-js --legacy-peer-deps
```

✅ Already completed

### Step 2: Configure Private Key

Open `src/config/encryption.js` and replace `YOUR_PRIVATE_KEY_HERE` with the actual Private Key from your PHP server.

**How to find your Private Key:**

1. Check your PHP server's `config.php` file
2. Look for a variable like `$Private_Key`
3. Copy the exact value to the encryption.js file

**Example:**

```javascript
// src/config/encryption.js
export const PRIVATE_KEY = 'your_actual_private_key_from_php';
```

**Important:** The Private Key must match EXACTLY with the PHP server's `$Private_Key` variable.

---

## How It Works

### PHP Response Format (from getMasterLogin.php)

```php
$Public_Key = getRandomKey(16); // 16 random characters
$chiper = CryptoAES::encrypt($result, $Public_Key . $Private_Key, 256);
echo ('{"data":' . json_encode($Public_Key . $chiper) . '}');
```

Response structure:
```json
{
  "data": "abcdefghijklmnop[encrypted_cipher_text_here]"
}
```

Where:
- First 16 characters: `abcdefghijklmnop` = Public Key (random, changes each request)
- Remaining characters: Encrypted cipher using AES-256

### JavaScript Decryption Process (crypto.js)

1. **Extract Public Key** (first 16 characters)
   ```javascript
   const publicKey = encryptedData.substring(0, 16);
   ```

2. **Extract Cipher** (remaining characters)
   ```javascript
   const cipher = encryptedData.substring(16);
   ```

3. **Combine Keys**
   ```javascript
   const fullKey = publicKey + PRIVATE_KEY;
   ```

4. **Decrypt using AES-256**
   ```javascript
   const decrypted = CryptoJS.AES.decrypt(cipher, fullKey, {
     keySize: 256 / 32,
     mode: CryptoJS.mode.CBC,
     padding: CryptoJS.pad.Pkcs7,
   });
   ```

5. **Parse JSON**
   ```javascript
   const parsedData = JSON.parse(decryptedString);
   ```

6. **Decode rawurlencoded fields**
   ```javascript
   decoded[key] = decodeURIComponent(data[key]);
   ```

---

## API Call Flow

### 1. Frontend makes request
```javascript
const response = await userAPI.getMasterLogin();
```

### 2. api.js sends POST request
```javascript
POST https://bluegrape.app/sispay/webservices/getMasterLogin.php
Content-Type: application/x-www-form-urlencoded

data={}
```

### 3. PHP returns encrypted response
```json
{
  "data": "q8x3m7k2p9n1v5z4U2FsdGVkX1+abcd..."
}
```

### 4. api.js extracts encrypted data
```javascript
const encryptedString = response.data.data;
```

### 5. crypto.js decrypts data
```javascript
const decryptedData = CRYPTO.decrypt(encryptedString);
```

### 6. Result structure
```javascript
{
  status: "ok",
  message: "Data retrieved successfully",
  records: [
    {
      login: "admin",
      active: "1",
      type: "1",
      merchantcode: "MC001",
      phoneNumber: "08123456789",
      agentName: "John Doe",
      alias: "Admin",
      useCredit: "0",
      description: "System Admin",
      isdm: "1",
      issetmerchant: "1",
      status: "1",
      agentgroupid: "1",
      menuaccess: "255"
    }
  ]
}
```

---

## Testing

### Test 1: Check Browser Console

1. Open DevTools → Console
2. Navigate to User Management → Accounts
3. Look for any decryption errors

**Expected output:**
- No errors in console
- Table displays user data correctly

**If you see errors:**
- Check if Private Key is correct
- Verify response format in Network tab
- Check console logs for debugging info

### Test 2: Network Tab Inspection

1. Open DevTools → Network tab
2. Navigate to User Management → Accounts
3. Find `getMasterLogin.php` request

**Check OPTIONS request (preflight):**
```
Request Method: OPTIONS
Status Code: 200 OK
```

**Check POST request (actual):**
```
Request Method: POST
Status Code: 200 OK
Response:
{
  "data": "q8x3m7k2p9n1v5z4U2FsdGVkX1+..."
}
```

### Test 3: Manual Decryption Test

Add this code temporarily in accountList.jsx to debug:

```javascript
const getListData = async () => {
  setLoading(true);
  try {
    const response = await userAPI.getMasterLogin();

    // Debug: Log the raw response
    console.log('Raw response:', response);
    console.log('Decrypted data:', response.data);

    if (response.success && response.data) {
      if (response.data.status?.toLowerCase() === 'ok') {
        console.log('Records:', response.data.records);
        setData(response.data.records || []);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## Troubleshooting

### ❌ Error: "Invalid encrypted data format"

**Cause:** Response doesn't have the expected structure

**Fix:**
1. Check if PHP response has `{"data": "..."}` structure
2. Verify CORS headers are set correctly in PHP
3. Check if session is valid (not expired)

### ❌ Error: "Decryption failed - empty result"

**Cause:** Wrong Private Key or encryption mismatch

**Fix:**
1. Verify Private Key matches PHP server exactly
2. Check if PHP uses the same encryption algorithm (AES-256)
3. Ensure PHP uses CBC mode with PKCS7 padding

### ❌ Error: "Failed to decrypt data"

**Cause:** Cipher format issue or key mismatch

**Fix:**
1. Compare encryption method in PHP vs JavaScript
2. Check if Public Key extraction is correct (first 16 chars)
3. Verify the cipher text is not corrupted

### ❌ Error: "Session expired"

**Cause:** Session timeout on PHP side

**Fix:**
1. Login again to refresh session
2. Check `checkSession.php` is working
3. Verify cookies are being sent with requests

### ❌ Data displays as "%..." or encoded text

**Cause:** rawurldecode not applied

**Fix:**
- This is already handled in `CRYPTO.decodeRawUrl()`
- Check if the function is being called in api.js
- Verify `decodeURIComponent()` is working correctly

---

## Security Notes

### For Development:

Currently using:
```javascript
export const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE';
```

### For Production:

Use environment variables:

1. Create `.env` file:
```bash
VITE_PRIVATE_KEY=your_actual_private_key
```

2. Update `src/config/encryption.js`:
```javascript
export const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY || '';

if (!PRIVATE_KEY) {
  console.error('PRIVATE_KEY not configured!');
}
```

3. Add `.env` to `.gitignore`:
```bash
echo ".env" >> .gitignore
```

**Important:** NEVER commit the Private Key to version control!

---

## Compatibility Notes

### PHP Side (Existing - DO NOT MODIFY)
- Uses `CryptoAES::encrypt()` with AES-256
- Response format: `{"data": "publicKey16+cipher"}`
- Data fields use `rawurlencode()`
- Session-based authentication

### JavaScript Side (New - UPDATED)
- Uses `crypto-js` library
- Compatible with PHP CryptoAES encryption
- Auto-decodes rawurlencoded data
- Handles encrypted and unencrypted responses

---

## Next Steps

1. ✅ Install crypto-js dependency
2. ⚠️ Configure Private Key in `src/config/encryption.js`
3. ⏳ Test API integration with real data
4. ⏳ Verify decryption works correctly
5. ⏳ Check table displays user data

---

## Checklist

- [ ] crypto-js installed successfully
- [ ] Private Key configured in `src/config/encryption.js`
- [ ] Login to application works
- [ ] Navigate to User Management → Accounts
- [ ] OPTIONS request returns 200 OK
- [ ] POST request returns 200 OK with encrypted data
- [ ] Data is decrypted successfully
- [ ] Table displays user records
- [ ] No console errors
- [ ] Search functionality works
- [ ] Edit/Delete buttons work

---

**Status:** ⚠️ Waiting for Private Key Configuration

**Last Updated:** 2025-11-19

# Authentication Setup Guide

Panduan lengkap untuk setup sistem authentication berbasis session + token untuk React frontend.

## 📋 Yang Sudah Dibuat

### 1. **Frontend Components** ✅
- Login page sudah ada di `src/layouts/auth/Index.jsx`
- Login logic di `src/layouts/auth/data/login-data.jsx`
- API client di `src/services/api.js`

### 2. **Backend PHP Files** ✅ (Perlu di-upload ke server)
Template PHP files ada di folder `php_templates/`:
- `login.php` - Endpoint untuk login
- `checkSession.php` - Endpoint untuk validasi session

### 3. **Protected Routes** ✅
- `LoggedInRoutes.jsx` - Routes yang memerlukan authentication
- `NotLoggedInRoutes.jsx` - Routes untuk user yang belum login

---

## 🚀 Langkah-Langkah Setup

### Step 1: Upload PHP Files ke Server

Upload 2 file berikut ke server Anda:
```
https://bluegrape.app/sispay/webservices/login.php
https://bluegrape.app/sispay/webservices/checkSession.php
```

**Cara Upload:**
1. Buka folder `php_templates/` di project ini
2. Upload `login.php` ke server menggunakan FTP/cPanel File Manager
3. Upload `checkSession.php` ke server
4. Pastikan kedua file berada di path: `/sispay/webservices/`

### Step 2: Test API Endpoints

**Test Login Endpoint:**
```bash
curl -X POST https://bluegrape.app/sispay/webservices/login.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=ADMIN&password=yourpassword"
```

**Expected Response (Success):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "abc123...",
    "username": "ADMIN",
    "type": "M",
    "merchantcode": "MCH001",
    "menuaccess": 1,
    "issetmerchant": 1,
    "sessionId": "sess_id_here"
  }
}
```

**Expected Response (Failed):**
```json
{
  "status": "error",
  "message": "Wrong username or password",
  "data": null
}
```

**Test Check Session:**
```bash
curl -X POST https://bluegrape.app/sispay/webservices/checkSession.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Cookie: PHPSESSID=your_session_id"
```

### Step 3: Test Login dari React

1. Jalankan development server:
```bash
npm run dev
```

2. Buka browser dan akses `http://localhost:5173/auth/login`

3. Masukkan username dan password

4. Jika berhasil:
   - Token akan disimpan di `localStorage`
   - User data akan disimpan di Redux store dan Cookie
   - Redirect ke dashboard `/`

---

## 🔧 Konfigurasi

### Database Configuration
File `config.php` di server harus sudah ada dengan isi:
```php
<?php
$MySQL_SERVER = "your_db_host";
$MySQL_DB = "your_db_name";
$MySQL_USER = "your_db_user";
$MySQL_PASSWORD = "your_db_password";
?>
```

### Database Table
Pastikan table `ms_login` memiliki struktur:
```sql
CREATE TABLE ms_login (
    v_user VARCHAR(50),
    v_password VARCHAR(255),  -- SHA1 hash
    v_active CHAR(1),
    v_logintype VARCHAR(10),
    v_merchantcode VARCHAR(50),
    n_menuaccess INT,
    n_issetmerchant INT,
    n_status INT
);
```

### Password Hashing
Password di database menggunakan **SHA1**:
```php
// Contoh insert user
INSERT INTO ms_login (v_user, v_password, v_active, n_status)
VALUES ('ADMIN', SHA1('password123'), 'Y', 1);
```

---

## 🔐 Cara Kerja Authentication

### 1. **Login Flow**
```
User Input (username, password)
    ↓
React Frontend → POST /login.php
    ↓
PHP validates credentials with database
    ↓
If valid: Create session + Generate token
    ↓
Return token + user data
    ↓
Frontend saves to localStorage + Redux + Cookies
    ↓
Redirect to dashboard
```

### 2. **Session Management**
- Session timeout: **15 minutes** (900 seconds)
- Session diperpanjang otomatis saat `checkSession.php` dipanggil
- Session variables:
  - `emoney_valid` - Boolean (true/false)
  - `emoney_timeout` - Timestamp
  - `emoney_username` - Username
  - `emoney_type` - User type
  - `emoney_merchant` - Merchant code
  - `emoney_access` - Menu access level
  - `emoney_setmerchant` - Set merchant flag
  - `emoney_token` - Generated token

### 3. **Protected Routes**
Routes di `LoggedInRoutes.jsx` akan:
- Check Redux store untuk `loginUser`
- Jika tidak ada → Redirect ke Login page
- Jika ada → Render content

---

## 📝 Testing Checklist

- [ ] Upload `login.php` ke server
- [ ] Upload `checkSession.php` ke server
- [ ] Test login endpoint dengan curl/Postman
- [ ] Test check session endpoint
- [ ] Test login dari React frontend
- [ ] Test auto-redirect jika belum login
- [ ] Test auto-redirect jika sudah login
- [ ] Test session timeout (15 menit)
- [ ] Test logout functionality

---

## 🐛 Troubleshooting

### Problem: CORS Error
**Solution:** Pastikan PHP files memiliki CORS headers:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Problem: Login tidak berhasil tapi credentials benar
**Checks:**
1. Cek password di database menggunakan SHA1:
   ```sql
   SELECT * FROM ms_login WHERE v_user='ADMIN' AND v_password=SHA1('password123');
   ```
2. Cek `v_active` = 'Y'
3. Cek `n_status` IN (1, 3)

### Problem: Session expired terlalu cepat
**Solution:** Ubah timeout di `checkSession.php`:
```php
// Dari 15 menit (900 detik) ke 30 menit (1800 detik)
(time() - $_SESSION['emoney_timeout']) <= 1800
```

### Problem: Token tidak tersimpan
**Checks:**
1. Buka browser DevTools → Application → Local Storage
2. Cek key `token` ada atau tidak
3. Cek Console untuk error messages

---

## 🔄 Flow Diagram

```
┌─────────────┐
│ User Access │
│   Website   │
└──────┬──────┘
       │
       ├─ Not Logged In? → Login Page
       │                        │
       │                        ↓
       │                   Enter Credentials
       │                        │
       │                        ↓
       │                   POST /login.php
       │                        │
       │                        ├─ Success → Save Token & Redirect
       │                        │
       │                        └─ Failed → Show Error
       │
       └─ Already Logged In? → Dashboard
                                   │
                                   ↓
                              Check Session Every Request
                                   │
                                   ├─ Valid → Continue
                                   │
                                   └─ Expired → Redirect to Login
```

---

## 📞 Support

Jika ada masalah, check:
1. Browser Console untuk JavaScript errors
2. Network tab untuk API request/response
3. PHP error logs di server
4. Database connection

---

**Status:** ✅ Ready to Deploy
**Last Updated:** 2025-11-19

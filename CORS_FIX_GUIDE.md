# CORS Fix Guide

## Masalah: Request Method OPTIONS bukan POST

Ketika mengakses API dari React (localhost) ke server (bluegrape.app), browser melakukan **CORS Preflight Check** menggunakan **OPTIONS method**.

### Mengapa OPTIONS?

```
Browser                          Server
   |                                |
   |  1. OPTIONS request (preflight)|
   |------------------------------>|
   |                                |
   |  2. Respond dengan CORS headers|
   |<------------------------------|
   |                                |
   |  3. POST request (actual)      |
   |------------------------------>|
   |                                |
   |  4. Response dengan data       |
   |<------------------------------|
```

**Preflight request (OPTIONS)** adalah mekanisme keamanan browser untuk mengecek apakah server mengizinkan cross-origin request.

---

## Solusi: Update PHP Files dengan CORS Headers

### Files yang Perlu Di-Update:

Upload 4 file berikut ke server:

1. ✅ `login.php` (sudah ada di php_templates/)
2. ✅ `checkSession.php` (sudah ada di php_templates/)
3. ✅ `getMasterLogin.php` (baru dibuat)
4. ✅ `deleteMasterLogin.php` (baru dibuat)

### Template CORS Headers untuk Semua PHP Files:

Setiap file PHP **HARUS** memiliki header berikut di **PALING ATAS** (sebelum `session_start()`):

```php
<?php
// CORS Headers - HARUS di atas sebelum session_start()
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Rest of your code...
?>
```

---

## Penjelasan CORS Headers:

### 1. `Access-Control-Allow-Origin: *`
- Mengizinkan request dari **semua domain**
- Untuk production, ganti `*` dengan domain spesifik:
  ```php
  header('Access-Control-Allow-Origin: https://yourdomain.com');
  ```

### 2. `Access-Control-Allow-Methods: POST, GET, OPTIONS`
- Mengizinkan method HTTP yang digunakan
- **OPTIONS** wajib untuk preflight request

### 3. `Access-Control-Allow-Headers: Content-Type, Authorization`
- Mengizinkan headers yang dikirim dari frontend
- Tambahkan header custom jika diperlukan

### 4. Handle OPTIONS Request
```php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```
- Langsung return 200 OK untuk preflight check
- **Wajib ada** agar browser melanjutkan ke POST request

---

## Step-by-Step Fix:

### Step 1: Upload File PHP Baru
Upload ke server:
```
getMasterLogin.php → https://bluegrape.app/sispay/webservices/getMasterLogin.php
deleteMasterLogin.php → https://bluegrape.app/sispay/webservices/deleteMasterLogin.php
```

### Step 2: Update File PHP yang Sudah Ada
Pastikan **login.php** dan **checkSession.php** sudah ter-upload (sudah ada di folder php_templates/).

### Step 3: Test dengan Browser DevTools

#### Test Preflight (OPTIONS):
```bash
curl -X OPTIONS https://bluegrape.app/sispay/webservices/getMasterLogin.php \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected Response:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Test Actual Request (POST):
```bash
curl -X POST https://bluegrape.app/sispay/webservices/getMasterLogin.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "data=" \
  -b "PHPSESSID=your_session_id"
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Data retrieved successfully",
  "records": [...]
}
```

### Step 4: Test dari React
1. Login ke aplikasi
2. Buka DevTools → Network tab
3. Navigate ke User Management → Accounts
4. Lihat requests:
   - **OPTIONS** request → Status 200 OK
   - **POST** request → Status 200 OK dengan data

---

## Troubleshooting:

### ❌ Problem: OPTIONS request 404 Not Found
**Cause:** File PHP tidak ada di server
**Fix:** Upload file ke server dengan path yang benar

### ❌ Problem: OPTIONS request 200 OK, tapi POST tidak terkirim
**Cause:** CORS headers tidak lengkap
**Fix:** Pastikan `Access-Control-Allow-Methods` include POST

### ❌ Problem: POST request error "No 'Access-Control-Allow-Origin' header"
**Cause:** CORS headers tidak di-set di POST response
**Fix:** Pastikan CORS headers ada di **setiap** response, bukan hanya OPTIONS

### ❌ Problem: Session expired / Unauthorized
**Cause:** Session tidak ter-maintain setelah login
**Fix:**
1. Check cookie `PHPSESSID` ada di browser
2. Pastikan request include credentials:
   ```javascript
   axios.defaults.withCredentials = true;
   ```

---

## Checklist:

- [ ] Upload `getMasterLogin.php` ke server
- [ ] Upload `deleteMasterLogin.php` ke server
- [ ] Verify `login.php` sudah ada CORS headers
- [ ] Verify `checkSession.php` sudah ada CORS headers
- [ ] Test OPTIONS request return 200 OK
- [ ] Test POST request return data
- [ ] Test dari React frontend berhasil fetch data
- [ ] Check Network tab tidak ada CORS error

---

## Alternative: Menggunakan .htaccess (Apache)

Jika tidak bisa edit PHP files, tambahkan di `.htaccess`:

```apache
# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Handle OPTIONS preflight
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

**Note:** Method .htaccess kurang fleksibel dan tidak semua hosting support.

---

## Best Practice untuk Production:

1. **Restrict Origin:**
   ```php
   header('Access-Control-Allow-Origin: https://yourdomain.com');
   ```

2. **Add Credentials:**
   ```php
   header('Access-Control-Allow-Credentials: true');
   ```

3. **Limit Methods:**
   ```php
   header('Access-Control-Allow-Methods: POST, OPTIONS');
   ```

4. **Add Security Headers:**
   ```php
   header('X-Content-Type-Options: nosniff');
   header('X-Frame-Options: DENY');
   header('X-XSS-Protection: 1; mode=block');
   ```

---

**Status:** ✅ Ready to Deploy
**Last Updated:** 2025-11-19

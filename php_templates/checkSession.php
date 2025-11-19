<?php
/**
 * Check Session API Endpoint
 * Path: https://bluegrape.app/sispay/webservices/checkSession.php
 *
 * Validates if user session is still valid (15 minute timeout)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$response = [
    'status' => 'error',
    'message' => 'Session expired or invalid',
    'data' => null
];

// Check if session is valid
if (
    isset($_SESSION['emoney_valid']) &&
    $_SESSION['emoney_valid'] === true &&
    isset($_SESSION['emoney_timeout']) &&
    (time() - $_SESSION['emoney_timeout']) <= 900 // 15 minutes = 900 seconds
) {
    // Update timeout
    $_SESSION['emoney_timeout'] = time();

    $response = [
        'status' => 'success',
        'message' => 'Session is valid',
        'data' => [
            'username' => $_SESSION['emoney_username'] ?? '',
            'type' => $_SESSION['emoney_type'] ?? '',
            'merchantcode' => $_SESSION['emoney_merchant'] ?? '',
            'menuaccess' => $_SESSION['emoney_access'] ?? '',
            'issetmerchant' => $_SESSION['emoney_setmerchant'] ?? '',
            'token' => $_SESSION['emoney_token'] ?? '',
            'sessionId' => session_id()
        ]
    ];
} else {
    // Clear invalid session
    unset($_SESSION['emoney_valid']);
    unset($_SESSION['emoney_timeout']);
    unset($_SESSION['emoney_username']);
    unset($_SESSION['emoney_type']);
    unset($_SESSION['emoney_merchant']);
    unset($_SESSION['emoney_access']);
    unset($_SESSION['emoney_setmerchant']);
    unset($_SESSION['emoney_token']);
}

echo json_encode($response);
?>

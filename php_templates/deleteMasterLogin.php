<?php
/**
 * Delete Master Login API Endpoint
 * Path: https://bluegrape.app/sispay/webservices/deleteMasterLogin.php
 */

// IMPORTANT: CORS Headers harus di-set SEBELUM session_start()
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

// Check if session is valid
if (!isset($_SESSION['emoney_valid']) || $_SESSION['emoney_valid'] !== true) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Check session timeout (15 minutes)
if (isset($_SESSION['emoney_timeout']) && (time() - $_SESSION['emoney_timeout']) > 900) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Session expired'
    ]);
    exit;
}

// Update session timeout
$_SESSION['emoney_timeout'] = time();

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// If data is encrypted, decrypt it here
// $data = CRYPTO::decrypt($data['data']);

$login = isset($data['login']) ? trim($data['login']) : '';

$response = [
    'status' => 'error',
    'message' => 'Invalid request'
];

if (empty($login)) {
    $response['message'] = 'Login parameter is required';
    echo json_encode($response);
    exit;
}

try {
    require_once('config.php');

    $conn = new PDO(
        "mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8",
        $MySQL_USER,
        $MySQL_PASSWORD
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("DELETE FROM ms_login WHERE v_user = ?");
    $stmt->bindValue(1, $login, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $response = [
            'status' => 'ok',
            'message' => 'User deleted successfully'
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'User not found or already deleted'
        ];
    }

    $stmt = null;
    $conn = null;

} catch (PDOException $e) {
    $response = [
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ];
}

echo json_encode($response);
?>

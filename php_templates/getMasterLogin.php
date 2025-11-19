<?php
/**
 * Get Master Login API Endpoint
 * Path: https://bluegrape.app/sispay/webservices/getMasterLogin.php
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
        'message' => 'Unauthorized access',
        'records' => []
    ]);
    exit;
}

// Check session timeout (15 minutes)
if (isset($_SESSION['emoney_timeout']) && (time() - $_SESSION['emoney_timeout']) > 900) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Session expired',
        'records' => []
    ]);
    exit;
}

// Update session timeout
$_SESSION['emoney_timeout'] = time();

try {
    require_once('config.php');

    $conn = new PDO(
        "mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8",
        $MySQL_USER,
        $MySQL_PASSWORD
    );
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("
        SELECT
            v_user as login,
            v_active as active,
            v_logintype as type,
            v_merchantcode as merchantcode,
            v_phoneNumber as phoneNumber,
            v_agentName as agentName,
            v_alias as alias,
            n_useCredit as useCredit,
            v_description as description,
            n_isdm as isdm,
            n_issetmerchant as issetmerchant,
            n_status as status,
            n_agentgroupid as agentgroupid,
            n_menuaccess as menuaccess
        FROM ms_login
        ORDER BY v_user ASC
    ");

    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // URL encode each field
    foreach ($records as &$record) {
        foreach ($record as $key => $value) {
            $record[$key] = urlencode($value ?? '');
        }
    }

    $response = [
        'status' => 'ok',
        'message' => 'Data retrieved successfully',
        'records' => $records
    ];

    $stmt = null;
    $conn = null;

} catch (PDOException $e) {
    $response = [
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage(),
        'records' => []
    ];
}

echo json_encode($response);
?>

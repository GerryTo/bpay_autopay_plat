<?php
/**
 * Login API Endpoint
 * Path: https://bluegrape.app/sispay/webservices/login.php
 *
 * This replaces the session-based login with a token-based authentication
 * compatible with React frontend
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

// Get POST data
$input = file_get_contents('php://input');
parse_str($input, $params);

// If no params from parse_str, try JSON decode
if (empty($params)) {
    $params = json_decode($input, true);
}

$username = isset($params['username']) ? trim(strtoupper($params['username'])) : '';
$password = isset($params['password']) ? $params['password'] : '';

$response = [
    'status' => 'error',
    'message' => 'Invalid credentials',
    'data' => null
];

if (empty($username) || empty($password)) {
    $response['message'] = 'Username and password are required';
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

    $stmt = $conn->prepare("
        SELECT
            v_user,
            v_logintype,
            v_merchantcode,
            n_menuaccess,
            n_issetmerchant
        FROM ms_login
        WHERE v_active='Y'
        AND v_user=?
        AND v_password=?
        AND n_status IN (1, 3)
    ");

    $stmt->bindValue(1, $username, PDO::PARAM_STR);
    $stmt->bindValue(2, sha1($password), PDO::PARAM_STR);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Generate session token
        $token = bin2hex(random_bytes(32));

        // Set session variables
        $_SESSION['emoney_valid'] = true;
        $_SESSION['emoney_timeout'] = time();
        $_SESSION['emoney_username'] = $username;
        $_SESSION['emoney_type'] = $user['v_logintype'];
        $_SESSION['emoney_merchant'] = $user['v_merchantcode'];
        $_SESSION['emoney_access'] = $user['n_menuaccess'];
        $_SESSION['emoney_setmerchant'] = $user['n_issetmerchant'];
        $_SESSION['emoney_token'] = $token;

        $response = [
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'username' => $username,
                'type' => $user['v_logintype'],
                'merchantcode' => $user['v_merchantcode'],
                'menuaccess' => $user['n_menuaccess'],
                'issetmerchant' => $user['n_issetmerchant'],
                'sessionId' => session_id()
            ]
        ];
    } else {
        $response['message'] = 'Wrong username or password';
    }

    $stmt = null;
    $conn = null;

} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>

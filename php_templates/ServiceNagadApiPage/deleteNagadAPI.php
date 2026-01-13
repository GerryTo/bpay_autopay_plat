<?php
session_start();
require_once 'require_files.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$result = '';
try {
  $data = json_decode(file_get_contents("php://input"), true);
  $v_mpaid = isset($data['v_mpaid']) ? $data['v_mpaid'] : '';

  if (empty($v_mpaid)) {
    $result = [
      'status' => 'no',
      'message' => 'v_mpaid is required',
      'records' => []
    ];
    echo (json_encode($result));
    exit;
  }

  $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $query = "UPDATE ms_api_login SET v_mpaid = '' WHERE v_mpaid = :v_mpaid AND v_bankcode = 'NAGAD'";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':v_mpaid', $v_mpaid, PDO::PARAM_STR);
  $stmt->execute();

  $rowCount = $stmt->rowCount();

  if ($rowCount > 0) {
    $result = [
      'status' => 'success',
      'message' => 'DONE DELETE MPAID',
      'records' => []
    ];
  } else {
    $result = [
      'status' => 'no',
      'message' => 'MPAID NOT FOUND',
      'records' => []
    ];
  }
} catch (Exception $e) {
  $result = [
    'status' => 'no',
    'message' => $e->getMessage(),
    'records' => []
  ];
}

echo (json_encode($result));
$conn = null;

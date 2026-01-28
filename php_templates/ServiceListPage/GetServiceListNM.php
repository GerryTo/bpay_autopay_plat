<?php
session_start();
require_once 'require_files.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$result = '';
try {
  $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $query = "SELECT * FROM ms_login_appium a LEFT JOIN ms_login b ON a.v_mainuser = b.v_user WHERE v_bankcode = 'MNAGAD' AND n_isdeleted != '1' ORDER BY v_mainuser ASC";
  $stmt = $conn->prepare($query);
  $stmt->execute();
  $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $result = [
    'status' => 'success',
    'message' => '',
    'records' => $res
  ];
} catch (Exception $e) {
  $result = [
    'status' => 'no',
    'message' => $e->getMessage(),
    'records' => []
  ];
}

echo (json_encode($result));
$conn = null;

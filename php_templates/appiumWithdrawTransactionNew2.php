<?php
set_time_limit(300);
date_default_timezone_set('Asia/Kuala_Lumpur');
session_start();
require_once 'require_files.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (stripos($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
  $param_POST = json_decode(file_get_contents("php://input"));
}
/*-- DECRYPT --*/
$data = (empty($_POST['data'])) ? ($param_POST->data) : ($_POST['data']);
// $Public_Key = substr($data,0,16);
// $dec_data = CryptoAES::decrypt(substr($data,16), $Public_Key.$Private_Key, 256);
// $data = json_decode($dec_data);
/*-------------*/

require_once './class/appium.php';
require_once './class/databaseAppium.php';
require_once './class/database.php';

$from = $data->datefrom;
$to = $data->dateto;
$status = $data->status;
$agent = $data->agent;
// $type = $data->type;
// $user = $data->user;

$result = '';
try {

  // $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
  // $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


  $db = new Database();
  $conn = $db->GetConnection();

  $appiumClass = new Appium($conn);

  $list = $appiumClass->GetWithdrawTransactionDataNew($from, $to, $status, $agent);
  $records = array();
  // var_dump($records);
  // exit;
  // print_r($list->fetchAll(PDO::FETCH_ASSOC));
  // exit();
  while ($row = $list->fetch(PDO::FETCH_ASSOC)) {
    $now = new DateTime();
    if ($status != 'pending') {
      $assignTime = isset($row['d_processtime']) ? new DateTime($row['d_processtime']) : new DateTime($row['d_assignTime']);
      $dateNow =  $now->format('Y-m-d H:i:s');
      $dateNow2 = new DateTime($dateNow);
      $diffTime = $assignTime->diff($dateNow2);
      $diff = $diffTime->format('%H:%I:%S');

      $start = new DateTime($row['d_insert']);
      $end = new DateTime($row['d_completedate']);
      $interval = $start->diff($end);
      $diffComplete2 = $interval->format('%H:%I:%S');
    }


    $tmp = array(
      "queue" => $status == 'pending' ? null : $row['v_queueid'],
      "id" => $row['n_futuretrxid'],
      "transactionid" => $row['v_transactionid'],
      "insert" => $row['d_insert'],
      "assignTime" => $status == 'pending' ? null : $row['d_assignTime'],
      "originaldate" => $row['d_originaldate'],
      "completedate" => $row['d_completedate'],
      "merchantcode" => $row['v_merchantcode'],
      "customercode" => $row['v_customercode'],
      "timestamp" => $row['d_timestamp'],
      "amount" => $row['n_amount'],
      "bankcode" => $row['v_bankcode'],
      "dstbankaccount" => $row['v_dstaccountname'],
      "dstbankaccountNo" => $row['v_dstbankaccountno'],
      "accountno" => $row['v_accountno'],
      "sourceaccountname" => $row['v_sourceaccountname'],
      "statusAutomation" => $status == 'pending' ? null : $row['v_statussend'],
      "statusTransaction" => $row['v_description'],
      "memo" => $row['v_memo'],
      "resendAttempt" => $status == 'pending' ? 0 : $row['n_countresend'],
      "agentProcess" => $status == 'pending' ? 0 : $row['n_agentprocess'],
      "SentMqtt" => ($status == 'pending') ? "" : (($row['n_issendtomqtt'] == 1) ? 'Y' : 'N'),
      "ReceiveMqtt" => ($status == 'pending') ? "" : (($row['n_isreceived'] == 1) ? 'Y' : 'N'),
      "duration" => ($status == 'Withdrawal Success') ? $diffComplete2 : (($status == 'pending') ? "" : $diff),
      "isWithdrawUpload" => $row['n_isWithdrawUpload'] ?? null,
      "notes3" => $row['v_notes3'] ?? null
    );
    array_push($records, $tmp);
  }

  $result = array(
    "status" => "ok",
    "filter" => $status,
    "message" => "",
    "records" => $records
  );
} catch (Exception $e) {

  $result = array(
    "status" => "no",
    "message" => $e->getMessage(),
    "records" => array()
  );
}
echo json_encode($result);

// $Public_Key = getRandomKey(16);
// $chiper = CryptoAES::encrypt($result, $Public_Key.$Private_Key, 256);
// echo json_encode(array("data" => $result));
$conn = null;

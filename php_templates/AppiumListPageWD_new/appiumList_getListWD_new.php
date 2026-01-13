<?php
set_time_limit(300);

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

require_once './class/appiumWD.php';
require_once './class/databaseAppium.php';

$from = $data->datefrom;
$to = $data->dateto;
$history = $data->history;
// $type = $data->type;
// $user = $data->user;

$result = '';
try {

    // $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
    // $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $dbAppium = new DatabaseAppium();
    $conn = $dbAppium->GetConnection();

    $appiumClass = new Appium($conn);
    if($history === true){
        $list = $appiumClass->GetListHistoryWD($from, $to);}
    else{
        $list = $appiumClass->GetListWD($from, $to);}
    $res = [];
    while ($row = $list->fetch(PDO::FETCH_ASSOC)) {
        if ($row['n_futuretrxid'] == -1) {
            $status = 'Refund';
        } else {
            $status = isset($row['n_futuretrxid']) ? 'Matched' : 'Pending';
        }

        $res[] = [
            "date" => $row['d_date'],
            "d_insert" => $row['d_insert'],
            "title" => $row['v_title'],
            "username" => $row['v_user'],
            "phonenumber" => $row['v_phonenumber'],
            "bankcode" => $row['v_bankcode'],
            "account" => $row['v_account'],
            "trxid" => $row['v_trxid'],
            "amount" => $row['n_amount'],
            "futuretrxid" => $row['n_futuretrxid'],
            "memo" => $row['v_memo'],
            "status" => $status
        ];
    }


    $result = [
        "status" => "ok",
        "message" => "",
        "records" => $res
    ];

} catch (Exception $e) {
    $result = '{ "status":"no", "message":"' . $e->getMessage() . '", "records":[]}';
}
// echo $result;

// $Public_Key = getRandomKey(16);
// $chiper = CryptoAES::encrypt($result, $Public_Key.$Private_Key, 256);
echo json_encode($result); 
$conn = null;

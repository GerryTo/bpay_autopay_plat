<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (stripos($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
    $param_POST = json_decode(file_get_contents("php://input"));
}

include_once __DIR__ . '/../config/base.config.php';
include_once __DIR__ . '/../class/database.php';
include_once __DIR__ . '/../class/auth.php';
include_once __DIR__ . '/../class/mybank.php';
include_once __DIR__ . '/../class/common.php';
include_once __DIR__ . '/../class/log.php';

$username = !empty($_POST['username']) ? $_POST['username'] : $param_POST->username;
$password = !empty($_POST['password']) ? $_POST['password'] : $param_POST->password;
$bank = !empty($_POST['bank']) ? $_POST['bank'] : $param_POST->bank;
$userBank = !empty($_POST['userBank']) ? $_POST['userBank'] : $param_POST->userBank;
$pin = !empty($_POST['pin']) ? $_POST['pin'] : $param_POST->pin;
$pinBkash = !empty($_POST['pinBkash']) ? $_POST['pinBkash'] : $param_POST->pinBkash;
$email = !empty($_POST['email']) ? $_POST['email'] : $param_POST->email;
$passwordBkash = !empty($_POST['passwordBkash']) ? $_POST['passwordBkash'] : $param_POST->passwordBkash;

$logFile = __DIR__ . "/../logs/login_otpsetter_" . date('Y-m-d_H') . ".txt";

if ($pin == null || $pin == '') {
    $pin = Null;
}

if ($pinBkash == null || $pinBkash == '') {
    $pinBkash = Null;
}

if ($passwordBkash == null || $passwordBkash == '') {
    $passwordBkash = Null;
}

if ($email == null || $email == '') {
    $email = Null;
}



$log = null;
$logDes = '';
$res = null;

try {

    $database = new Database();
    $conn = $database->GetConnection();

    $auth = new Auth($conn);
    $mybank = new Mybank($conn);
    $log = new Log($conn);
    $common = new Common();

    // $common->WriteLog($logFile, json_encode($param_POST));

    $logDes .= "Username: " . $username . ", Password: " . $password . " (" . sha1($password) . "), Bank: " . $bank . ", User Bank: " . $userBank . ", Email: " . $email . ", Password Bkash: " . "$passwordBkash" . ", Pin Nagad: " . $pin . ", Pin Bkash: " . $pinBkash . "; ";

    $resLogin = $auth->LoginOtpSetter($username, $password);
    if (count($resLogin) == 0) throw new Exception('Invalid Username or Password');

    $res = array("status" => "success", "message" => "", "data" => array());
    foreach ($resLogin as $row) {

        $mybankData = $mybank->GetAccountByUserAndBank($row['v_phonenumber'], strtoupper($bank));
        if (count($mybankData) == 0) throw new Exception('User Bank not found');

        if (empty($email)) {
            $same = false;
            foreach ($mybankData as $rowBank) {
                if ($userBank == $rowBank['v_bankaccountno']) {
                    $same = true;
                    break;
                }
            }
            if (!$same) throw new Exception('Invalid User Bank');
        }

        $token = $common->CreateToken($username);
        $auth->SetTokenOtpSetter($username, $token);

        $auth->SetUserBankPinV2($username, $bank, $userBank, $pin, $pinBkash, $email, $passwordBkash);

        $res['data'] = array("username" => $username, "token" => $token, "phonenumber" => $row['v_phonenumber']);

        $logDes .= "SUCCESS, token: " . $token . "; ";
    }
} catch (Exception $e) {
    $res = array("status" => "failed", "message" => $e->getMessage(), "data" => array());
    $logDes .= "FAILED, error: " . $e->getMessage() . "; ";
}
$log->Add("LOGIN", $logDes, "OTP SETTER");
echo json_encode($res);
$conn = null;

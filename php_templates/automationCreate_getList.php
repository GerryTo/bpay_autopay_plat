<?php
session_start();
require_once 'require_files.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (stripos($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
    $param_POST = json_decode(file_get_contents("php://input"));
}
/*-- DECRYPT --*/
$data = (empty($_POST['data'])) ? trim($param_POST->data) : trim($_POST['data']);
// $data = Decrypt($data, $Private_Key);
/*-------------*/

// $from = $data->from;
// $to = $data->to;

// $currDate = date('Y-m-d', strtotime('-1 days')) . " 00:00:00";

// $useHistory = false;
// if (strtotime($from) < strtotime($currDate)) $useHistory = true;

$result = '';
try {

    $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "SELECT A.v_mainuser, B.v_phonenumber, A.v_bankcode, A.v_username, A.v_system, A.v_serialnumber, A.n_isonline, A.v_servername, A.d_heartbeat,
    CASE 
        WHEN A.v_bankcode = 'NAGAD' AND A.v_system = 'AUTOMATION' THEN B.v_pin 
        WHEN A.v_bankcode = 'Bkash' AND A.v_system = 'AUTOMATION' THEN B.v_bkash_pin 
        ELSE NULL 
    END AS pin,
    CASE 
        WHEN A.v_bankcode = 'NAGAD' THEN C.v_opentype
        WHEN A.v_bankcode = 'BKASH' THEN C.v_opentype
        ELSE NULL 
    END AS opentype,
    n_otperror,
    MAX(CASE WHEN B.d_heartbeat_otpsetter IS NOT NULL THEN B.d_heartbeat_otpsetter END) AS d_heartbeat_otpsetter,
    C.n_useappium,
    C.n_automation_status
    FROM ms_login_appium A JOIN ms_login B ON A.v_mainuser = B.v_user LEFT JOIN mybank C ON B.v_phonenumber = C.v_phonenumber AND A.v_bankcode = C.v_bankcode  WHERE 
    A.v_mainuser != 'TEST_NAGAD' AND A.n_isdeleted = '0'
    GROUP BY A.v_mainuser, A.v_bankcode";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $records = array();

    while ($rows = $stmt->fetchAll(PDO::FETCH_ASSOC)) {
        foreach ($rows as $row) {

            $datetime_1 = $row['d_heartbeat_otpsetter'];
            $datetime_2 = date('Y-m-d H:i:s');

            $date_automation = $row['d_heartbeat'];

            $from_time = strtotime($datetime_1);
            $to_time = strtotime($datetime_2);
            $automation = strtotime($date_automation);


            $diff_minutes = round(abs($from_time - $to_time) / 60, 2);
            $diff_automation = round(abs($automation - $to_time) / 60, 2);

            $status = 1;
            $statusDescOtp = "ONLINE";
            if ($diff_minutes > 5) {
                $status = 0;
                $statusDescOtp = "OFFLINE";
            }

            $statusDescAutomation = "ONLINE";
            if ($diff_automation > 0.5) {
                $status_automation = 0;
                $statusDescAutomation = "OFFLINE";
            }


            $tmp = array(
                "mainUser" => $row['v_mainuser'],
                "bankCode" => $row['v_bankcode'],
                "username" => $row['v_username'],
                "system" => $row['v_system'],
                "pin" => $row['pin'],
                "opentype" => $row['opentype'],
                "serverName" => $row['v_servername'],
                "isOnline" => $statusDescAutomation,
                "serialNumber" => $row['v_serialnumber'],
                "statusDesOtpSender" => $statusDescOtp,
                "phonenumber" => $row['v_phonenumber'],
                "otperror" => $row['n_otperror'] == 1 ? "Not Receive" : "Receive",
                "useappium" => $row['n_useappium'] == 1 ? "YES" : "NO",
                "AutomationStatus" => $row['n_automation_status'] == 1 ? "YES" : ($row['n_automation_status'] == 2 ? "ERROR OTP" : ($row['n_automation_status'] == '0' ? "NO" : ($row['n_automation_status'] == 'N' ? "INACTIVE" : "Not SET")))
                // "completeTimestamp" => $row['d_completedate'],
                // "resubmitTimestamp" => $row['d_lastresubmit'],
                // "merchantCode" => $row['v_merchantcode'],
                // "customerCode" => $row['v_customercode'],
                // "bankCode" => $row['v_bankcode'],
                // "amount" => $row['n_amount'],
                // "transactionType" => $row['v_transactiontype'],
                // "status" => $row['v_status'],
                // "transactionId" => $row['v_transactionid'],
                // "memo" => $row['v_memo'],
                // "memo3" => $row['v_memo3'],
                // "trxId" => $row['v_notes3'],
                // "phonenumber" => $row['v_phonenumber'],
                // "accountNo" => $row['v_accountno'],
                // "accountName" => $row['v_sourceaccountname'],
                // "destAccountNo" => $row['v_dstbankaccountno'],
                // "destAccountName" => $row['v_dstaccountname'],
                // "isSuccessManually" => $row['n_isSuccessManually'] == 1 ? 'Y' : 'N'
            );

            array_push($records, $tmp);
        }
        $result = array(
            "status" => "ok",
            "message" => "",
            "records" => $records
        );
    }
} catch (Exception $e) {

    $result = array(
        "status" => "no",
        "message" => $e->getMessage(),
        "records" => array()
    );
}
echo json_encode($result);
$conn = null;
$stmt = null;

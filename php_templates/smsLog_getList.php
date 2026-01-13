<?php
	set_time_limit(300);

	session_start();
	require_once 'require_files.php';

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	if(stripos($_SERVER["CONTENT_TYPE"],"application/json")==0)
	{
		$param_POST = json_decode(file_get_contents("php://input"));
	}
	/*-- DECRYPT --*/
	$data = (empty($_POST['data']))?($param_POST->data):($_POST['data']);
	// $Public_Key = substr($data,0,16);
	// $dec_data = CryptoAES::decrypt(substr($data,16), $Public_Key.$Private_Key, 256);
	// $data = json_decode($dec_data);
    /*-------------*/

    $from = $data->datefrom;
    $to = $data->dateto;
	$type = $data->type;
	$user = $data->user;

    $result = '';
	try{

		$conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


		$query = "SELECT a.*,b.v_alias FROM tbl_sms a join ms_login b on a.v_user = b.v_user WHERE a.d_timestamp >= '".$from."' AND a.d_timestamp <= '".$to."' ";
		if($type == "1"){
			$query .= "AND (n_futuretrxid != '' AND n_futuretrxid is not null) AND n_statussmsid = 2 ";
		}else if($type == "2"){
			$query .= "AND (n_futuretrxid = '' OR n_futuretrxid is null) AND v_securitycode != '' AND v_type != '' AND n_statussmsid != 4 ";
		}else if($type == "3"){
			$query .= "AND (v_securitycode = '' OR v_type = '') AND n_statussmsid != 4 ";
		}else if($type == "4"){
			$query = "select a.*, b.v_alias from (SELECT a.* from tbl_sms a,
			(SELECT MAX(d_timestamp) AS max_time, v_type, v_user FROM tbl_sms GROUP BY v_type, v_user) AS b
			WHERE a.d_timestamp = b.max_time AND a.v_type = b.v_type AND a.v_user = b.v_user AND a.v_transactiontype != 'JUNK') a join ms_login b on a.v_user=b.v_user ";
		}else if($type == "5"){
			$query .= "AND v_transactiontype != 'JUNK' AND v_suspectedreason != 'Service Center is not registered' AND v_suspectedreason != 'Sender Phone Number is not registered' ";
		}

		if($user != ''){
      $field = $type == "4" ?'a.v_user':'a.v_user';
			$query .= "AND ".$field." = '$user' ";
		}

    if($type == "4"){
      $query .= "GROUP BY a.v_user, v_type 
      ORDER BY d_timestamp";
    }


		$stmt = $conn->prepare($query);
		$stmt->execute();
		$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

		$outp = "";
		foreach($res as $row)
		{

			$isDisabled = 0;
			$tmp = explode(' ', $row['d_timestamp']);

			if($_SESSION['emoney_username'] != 'ADMIN' && $tmp[0] != date('Y-m-d')){
				$isDisabled = 1;
			}

			$timestampBdt = isset($row['d_timestamp']) ? $row['d_timestamp'] : '';
			if($timestampBdt != ''){
        $date = new DateTime($row['d_timestamp']);
				if(strtotime($timestampBdt) >= strtotime('2022-12-01 00:00:00')) 
        {
          $date->setTimezone(new DateTimeZone('Asia/Dhaka'));
          $timestampBdt = $date->format('Y-m-d H:i:s');
        }
			}

			// $query = "SELECT v_alias FROM ms_login WHERE v_user = ?";
			// $stmt2 = $conn->prepare($query);
			// $stmt2->bindValue(1, $row['v_user'], PDO::PARAM_STR);
			// $stmt2->execute();
			$alias = $row['v_alias'];
			// while($row2 = $stmt2->fetch(PDO::FETCH_ASSOC)){
			// 	$alias = $row2['v_alias'];
			// }

			if ($outp != "") {$outp .= ",";}
			$outp .= '{"timestamp":"'.$row['d_timestamp'].'",';
			$outp .= '"timestampBdt":"'.$timestampBdt.'",';
			$outp .= '"message":"'. rawurlencode($row["v_message"]). '",'; 
			$outp .= '"from":"'. rawurlencode($row["v_sender"]). '",'; 
			$outp .= '"type":"'. $row["v_type"]. '",'; 
			$outp .= '"securitycode":"'. $row["v_securitycode"]. '",'; 
			$outp .= '"customerphone":"'. $row["v_customerphone"]. '",'; 
			$outp .= '"phonenumber":"'. $row["v_phonenumber"]. '",';
			$outp .= '"amount":"'. $row["n_amount"]. '",'; 
			$outp .= '"futuretrxid":"'. ($row["n_futuretrxid"] == null ? '' : $row['n_futuretrxid']). '",';
			$outp .= '"disabled":"'. $isDisabled. '",';  
			$outp .= '"username":"'. $row['v_user']. '",';  
			$outp .= '"alias":"'. $alias. '",';  
			$outp .= '"servicecenter":"'. $row["v_serviceCenter"]. '",';
			$outp .= '"smsid":"'. rawurlencode($row["v_id"]). '",';
			$outp .= '"transactiontype":"'. $row["v_transactiontype"]. '",';
			$outp .= '"suspectedreason":"'. $row["v_suspectedreason"]. '",';
			$outp .= '"balance":'. (empty($row["n_balance"]) ? 0 : $row["n_balance"]). ',';
			$outp .= '"balancecalculate":'. (empty($row["n_balance_calculate"]) ? 0 : $row["n_balance_calculate"]). ',';
			$outp .= '"balancediff":'. (empty($row["n_balance_diff"]) ? 0 : $row["n_balance_diff"]). ',';
			$outp .= '"matchmanually":"'. ($row["n_ismatchmanually"] == "1" ? 'Yes' : 'No'). '",';
			$outp .= '"matchdate":"'. (empty($row["d_matchdate"]) ? '' : $row["d_matchdate"]). '"}';
		}

		$result = '{ "status":"ok", "message":"", "records":['.$outp.']}';

	}catch(Exception $e){
		$result = '{ "status":"no", "message":"'.$e->getMessage().'", "records":[]}';
	}
	// echo $result;

	// $Public_Key = getRandomKey(16);
    // $chiper = CryptoAES::encrypt($result, $Public_Key.$Private_Key, 256);
    echo('{"data":'.json_encode($result).'}');
	// $conn = null;

?>

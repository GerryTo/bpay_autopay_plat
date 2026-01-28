<?php
	session_start();
	require_once 'require_files.php';

	if( $_SESSION['emoney_valid']!=true )
        {
                exit;
        }

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	if(stripos($_SERVER["CONTENT_TYPE"],"application/json")==0)
	{
		$param_POST = json_decode(file_get_contents("php://input"));
	}
	/*-- DECRYPT --*/
	$data = (empty($_POST['data']))?trim($param_POST->data):trim($_POST['data']);
	$Public_Key = substr($data,0,16);
	$dec_data = CryptoAES::decrypt(substr($data,16), $Public_Key.$Private_Key, 256);
	$data = json_decode($dec_data);
	/*-------------*/
	$datefrom = $data->datefrom;
	$dateto = $data->dateto;
	if( isset($data->transactiontype)) 
		$transactiontype= $data->transactiontype;
	if( isset($data->statusValue))
		$statusValue=$data->statusValue;
	$merchantcode = $_SESSION["emoney_merchant"];
	if(property_exists((object)$data, 'merchantcode')){
		if($data->merchantcode!= '')
			$merchantcode = $data->merchantcode;
	}

	$result = '';
	try{

		$conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	$query = "SELECT 
					A.v_merchantcode,
					DATE(A.d_insert) as day,
					round(SUM(CASE WHEN A.v_transactiontype IN ('D','Y') THEN A.n_amount ELSE 0 END), 2) as total_deposit,
					round(SUM(CASE WHEN A.v_transactiontype IN ('W','Z') THEN A.n_amount ELSE 0 END), 2) as total_withdraw,
					round(SUM(A.n_amount), 2) as total_amount
						FROM 
							transaction A 
								LEFT JOIN 
									ms_status B 
									
									ON A.v_status=B.v_status 
								LEFT JOIN ms_bank2 C 
									
									ON A.v_bankcode=C.v_bankcode WHERE 1=1 ";
		$params = [];
		if($merchantcode!= '' && strtoupper($merchantcode) != 'ALL'){
			$query.=" AND v_merchantcode = :merchantcode ";
			$params[':merchantcode'] = $merchantcode;
		}
		/*if($accountno!= '0' ){
			$query.=" AND v_accountno = '".$accountno."' ";
		}*/
		
		$query .=" AND A.v_status = 0";
		
		if($datefrom != ''){
			$query.=" AND d_insert BETWEEN :datefrom AND :dateto";
			$params[':datefrom'] = $datefrom;
			$params[':dateto'] = $dateto;
		}

		//$query.=" and A.v_transactiontype not in ('D','N','Y') ";	
		$query.=" and A.v_transactiontype in ('W','D','Y','Z') ";	
		$query.="and v_merchantcode != ''";
		
		if( isset($data->statusValue)) {
			$query.=" AND A.v_status = :statusValue";
			$params[':statusValue'] = $statusValue;
		}
			
		$query.=" GROUP BY A.v_merchantcode, DATE(A.d_insert)";

		$stmt = $conn->prepare($query);
		foreach($params as $key => $value){
			$stmt->bindValue($key, $value);
		}
		$stmt->execute();
		$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

		$outp = "";
		foreach($res as $row)
		{
			if ($outp != "") {$outp .= ",";}
			$outp .= '{"merchantcode":"'. rawurlencode($row["v_merchantcode"]). '",';
			$outp .= '"day":"'. rawurlencode($row["day"]). '",'; 
			$outp .= '"total_deposit":"'. rawurlencode($row["total_deposit"]). '",'; 
			$outp .= '"total_withdraw":"'. rawurlencode($row["total_withdraw"]). '",'; 
			$outp .= '"total_amount":"'. rawurlencode($row["total_amount"]). '"}'; 
		}
		$stmt=null;
		$result = '{ "status":"ok", "message":"", "records":['.$outp.']}';

	}catch(Exception $e){
		$result = '{ "status":"no", "message":"'.$e->getMessage().'", "records":[]}';
	}
	$Public_Key = getRandomKey(16);
	$chiper = CryptoAES::encrypt($result, $Public_Key.$Private_Key, 256);
	echo('{"data":'.json_encode($Public_Key.$chiper).'}');
	$conn = null;

?>

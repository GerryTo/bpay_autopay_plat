<?php
session_start();

require_once 'require_files.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (stripos($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
    $param_POST = json_decode(file_get_contents("php://input"));
}

$result = '';
try {
    $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    date_default_timezone_set('Asia/Dhaka');
    $records = array();

    $dateNow = date('Y-m-d');
    $dateNowDiff2 = date('Y-m-d', strtotime('-1 day', strtotime($dateNow)));
    $yesterday = date('Y-m-d', strtotime('-1 day', strtotime($dateNow)));

    $dateTimeNow = date('H:i:s');
    $startTime = '00:00:00';
    $endTime = '02:00:00';

    $flag = 0;
    if ($dateTimeNow >= $startTime && $dateTimeNow <= $endTime) {
        $yesterday = date('Y-m-d', strtotime('-1 day', strtotime($yesterday)));
        $flag = 1;
    }

    // Query untuk mengambil data dari tbl_transaction_per_five_minute
    $queryGetTransaction = "SELECT 
        latest.v_agent AS agentUsername, 
        latest.v_bankaccno AS accountno,
        DATE(latest.latest_d_insert) AS 'date',
        latest.latest_d_insert AS d_insert,
        latest_values.n_lastbalance AS finalNagadCredit,  -- n_lastbalance from the latest record
        latest_values.bkash_lastbalance AS finalBkashCredit,  -- n_lastbalance from the latest record

        COALESCE(SUM(t.n_totaldeposit), 0) AS totalCashOut, 
        COALESCE(SUM(t.n_totalwithdraw), 0) AS totalCashIn,
        COALESCE(SUM(CASE WHEN t.v_bankcode = 'NAGAD' THEN t.n_totaldeposit ELSE 0 END), 0) AS totalCashOutNagad,  
        COALESCE(SUM(CASE WHEN t.v_bankcode = 'NAGAD' THEN t.n_totalwithdraw ELSE 0 END), 0) AS totalCashInNagad,  
        COALESCE(SUM(CASE WHEN t.v_bankcode = 'BKASH' THEN t.n_totaldeposit ELSE 0 END), 0) AS totalCashOutBkash, 
        COALESCE(SUM(CASE WHEN t.v_bankcode = 'BKASH' THEN t.n_totalwithdraw ELSE 0 END), 0) AS totalCashInBkash,

        COALESCE(SUM(CASE WHEN t.v_bankcode = 'NAGAD' THEN t.n_adjustmentin ELSE 0 END) + SUM(CASE WHEN t.v_bankcode = 'BKASH' THEN t.n_adjustmentin ELSE 0 END), 0) AS finalAdjustmentIn,
        COALESCE(SUM(CASE WHEN t.v_bankcode = 'NAGAD' THEN t.n_adjustmentout ELSE 0 END) + SUM(CASE WHEN t.v_bankcode = 'BKASH' THEN t.n_adjustmentout ELSE 0 END), 0) AS finalAdjustmentOut,

        COALESCE(SUM(CASE WHEN t.v_bankcode = 'NAGAD' THEN t.n_topup ELSE 0 END) + SUM(CASE WHEN t.v_bankcode = 'BKASH' THEN t.n_topup ELSE 0 END), 0) AS finalTopUp
    FROM 
        tbl_transaction_per_five_minute t
    JOIN 
        (
            SELECT
                v_agent,
                MAX(d_insert) AS latest_d_insert,
                v_bankaccno
            FROM
                tbl_transaction_per_five_minute
            GROUP BY
                v_agent
        ) latest
    ON 
        t.v_agent = latest.v_agent
    JOIN
    (SELECT
                t1.v_agent,
                MAX(CASE WHEN t1.v_bankcode = 'NAGAD' THEN t1.n_lastbalance ELSE NULL END) AS n_lastbalance,
                MAX(CASE WHEN t1.v_bankcode = 'BKASH' THEN t1.n_lastbalance ELSE NULL END) AS bkash_lastbalance
            FROM
                tbl_transaction_per_five_minute t1
            JOIN
                (
                    SELECT
                        v_agent,
                        v_bankcode,
                        MAX(d_insert) AS latest_d_insert
                    FROM
                        tbl_transaction_per_five_minute
                    GROUP BY
                        v_agent, v_bankcode
                ) t2
            ON
                t1.v_agent = t2.v_agent AND
                t1.v_bankcode = t2.v_bankcode AND
                t1.d_insert = t2.latest_d_insert
            GROUP BY
                t1.v_agent
            ) latest_values
            ON
        t.v_agent = latest_values.v_agent";

    if ($flag == 1) {
        $queryGetTransaction .= " WHERE  DATE(d_insert) >= '$dateNowDiff2' AND DATE(d_insert) <= '$dateNow' GROUP BY 
        latest.v_agent, latest.latest_d_insert, latest_values.n_lastbalance, latest_values.bkash_lastbalance
    ORDER BY 
        latest.latest_d_insert DESC";
    } else {
        $queryGetTransaction .= " WHERE DATE(d_insert) = '$dateNow' GROUP BY 
        latest.v_agent, latest.latest_d_insert, latest_values.n_lastbalance, latest_values.bkash_lastbalance
    ORDER BY 
        latest.latest_d_insert DESC";
    }
    $stmt = $conn->prepare($queryGetTransaction);
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cek apakah transaksi terbaru ada dan diperbarui dalam 1 menit
   $lastTransactionTime = isset($transactions[0]['d_insert']) ? $transactions[0]['d_insert'] : null;

    if ($lastTransactionTime) {
        // Cek jika waktu terakhir transaksi lebih dari 10 menit yang lalu
        $lastTransactionTimeTimestamp = strtotime($lastTransactionTime);
        $currentTimestamp = time();

        // Jika lebih dari 10 menit, jalankan nightQuery
        if (($currentTimestamp - $lastTransactionTimeTimestamp) > 360) {
            // Tambahkan 5 menit ke $lastTransactionTime untuk datestart
            $datestart = date('Y-m-d H:i:s', strtotime($lastTransactionTime . ' + 5 minutes'));
        } else {
            // Jika transaksi terbaru sudah ada dalam 10 menit terakhir, set $datestart ke waktu transaksi terakhir
            $datestart = null;
        }
    } else {
        // Jika tidak ada transaksi, set $datestart ke null atau waktu default
        $datestart = null;
    }

    $datenow = date('Y-m-d H:i:s');

    if ($datestart) {
        // Execute the nightQuery to fetch transaction data
        $nightQuery = "
            SELECT 
                CASE 
                    WHEN v_transactiontype = 'W' THEN v_accountno
                    WHEN v_transactiontype = 'D' THEN v_dstbankaccountno
                    ELSE NULL
                END AS accountno,
                SUM(CASE WHEN v_transactiontype = 'D' THEN n_amount ELSE 0 END) AS extra_cashout,
                SUM(CASE WHEN v_transactiontype = 'W' THEN n_amount ELSE 0 END) AS extra_cashin,
                SUM(CASE WHEN v_transactiontype = 'D' AND v_bankcode = 'NAGAD' THEN n_amount ELSE 0 END) AS cashout_nagad,
                SUM(CASE WHEN v_transactiontype = 'W' AND v_bankcode = 'NAGAD' THEN n_amount ELSE 0 END) AS cashin_nagad,
                SUM(CASE WHEN v_transactiontype = 'D' AND v_bankcode = 'BKASH' THEN n_amount ELSE 0 END) AS cashout_bkash,
                SUM(CASE WHEN v_transactiontype = 'W' AND v_bankcode = 'BKASH' THEN n_amount ELSE 0 END) AS cashin_bkash
            FROM transaction
            WHERE v_status = '0'
                AND (DATE_SUB(d_completedate, INTERVAL 2 HOUR) >= :dateFrom AND DATE_SUB(d_completedate, INTERVAL 2 HOUR) <= :dateTo)
                AND n_isWithdrawUpload != 3
            GROUP BY accountno
        ";

        $nightStmt = $conn->prepare($nightQuery);
        $nightStmt->bindValue(':dateFrom', $datestart, PDO::PARAM_STR);
        $nightStmt->bindValue(':dateTo', $datenow, PDO::PARAM_STR);
        $nightStmt->execute();
        $nightRows = $nightStmt->fetchAll(PDO::FETCH_ASSOC);

        // Execute the adjustmentQuery to fetch adjustment data
        $adjusmentQuery = "
            SELECT 
                v_bankaccountno AS accountno,
                SUM(CASE WHEN v_type = 'IN' AND v_note Not Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS AdjustmentIn,
                SUM(CASE WHEN v_type = 'OUT' THEN n_amount ELSE 0 END) AS AdjustmentOut,
                SUM(CASE WHEN v_type = 'IN' AND v_note Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS Topup,
                SUM(CASE WHEN v_type = 'IN' AND v_bankcode = 'NAGAD' AND v_note Not Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS AdjustmentIn_Nagad,
                SUM(CASE WHEN v_type = 'OUT' AND v_bankcode = 'NAGAD' THEN n_amount ELSE 0 END) AS AdjustmentOut_Nagad,
                SUM(CASE WHEN v_type = 'IN' AND v_bankcode = 'NAGAD' AND v_note Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS Topup_Nagad,
                SUM(CASE WHEN v_type = 'IN' AND v_bankcode = 'BKASH' AND v_note Not Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS AdjustmentIn_Bkash,
                SUM(CASE WHEN v_type = 'OUT' AND v_bankcode = 'BKASH' THEN n_amount ELSE 0 END) AS AdjustmentOut_Bkash,
                SUM(CASE WHEN v_type = 'IN' AND v_bankcode = 'BKASH' AND v_note Like 'TOPUP REQUEST ID%' THEN n_amount ELSE 0 END) AS Topup_Bkash
            FROM tbl_agent_credit_adjustment
            WHERE (DATE_SUB(d_insert, INTERVAL 2 HOUR) >= :dateFrom AND DATE_SUB(d_insert, INTERVAL 2 HOUR) <= :dateTo)
            GROUP BY v_bankaccountno
        ";
        $adjustmentStmt = $conn->prepare($adjusmentQuery);
        $adjustmentStmt->bindValue(':dateFrom', $datestart, PDO::PARAM_STR);
        $adjustmentStmt->bindValue(':dateTo', $datenow, PDO::PARAM_STR);
        $adjustmentStmt->execute();
        $adjustmentRows = $adjustmentStmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize credit fields for all transactions if not exists
        foreach ($transactions as &$transaction) {
            if (!isset($transaction['finalNagadCredit'])) {
                $transaction['finalNagadCredit'] = 0;
            }
            if (!isset($transaction['finalBkashCredit'])) {
                $transaction['finalBkashCredit'] = 0;
            }
            if (!isset($transaction['totalCashOut'])) {
                $transaction['totalCashOut'] = 0;
            }
            if (!isset($transaction['totalCashIn'])) {
                $transaction['totalCashIn'] = 0;
            }
            if (!isset($transaction['totalCashOutNagad'])) {
                $transaction['totalCashOutNagad'] = 0;
            }
            if (!isset($transaction['totalCashInNagad'])) {
                $transaction['totalCashInNagad'] = 0;
            }
            if (!isset($transaction['totalCashOutBkash'])) {
                $transaction['totalCashOutBkash'] = 0;
            }
            if (!isset($transaction['totalCashInBkash'])) {
                $transaction['totalCashInBkash'] = 0;
            }
            if (!isset($transaction['finalAdjustmentIn'])) {
                $transaction['finalAdjustmentIn'] = 0;
            }
            if (!isset($transaction['finalAdjustmentOut'])) {
                $transaction['finalAdjustmentOut'] = 0;
            }
            if (!isset($transaction['finalTopUp'])) {
                $transaction['finalTopUp'] = 0;
            }
        }
        unset($transaction); // Break the reference

        // Merge night query results with transactions
        foreach ($nightRows as $nightRow) {
            $accountno = $nightRow['accountno'];
            
            // Skip if accountno is null
            if (!$accountno) continue;
            
            $cashout = $nightRow['extra_cashout'];
            $cashin = $nightRow['extra_cashin'];
            $cashout_nagad = $nightRow['cashout_nagad'];
            $cashin_nagad = $nightRow['cashin_nagad'];
            $cashout_bkash = $nightRow['cashout_bkash'];
            $cashin_bkash = $nightRow['cashin_bkash'];

            // Loop through transactions and add night data to corresponding fields
            foreach ($transactions as &$transaction) {
                if ($transaction['accountno'] == $accountno) {
                    $transaction['totalCashOut'] += $cashout;
                    $transaction['totalCashIn'] += $cashin;
                    $transaction['totalCashOutNagad'] += $cashout_nagad;
                    $transaction['totalCashInNagad'] += $cashin_nagad;
                    $transaction['totalCashOutBkash'] += $cashout_bkash;
                    $transaction['totalCashInBkash'] += $cashin_bkash;
                    
                    // Fixed credit calculation for NAGAD - corrected variable assignment
                    $finalCreditNagad = $transaction['finalNagadCredit'] + $cashin_nagad - $cashout_nagad;
                    $transaction['finalNagadCredit'] = $finalCreditNagad;
                    
                    // Fixed credit calculation for BKASH - corrected variable assignment  
                    $finalCreditBkash = $transaction['finalBkashCredit'] + $cashin_bkash - $cashout_bkash;
                    $transaction['finalBkashCredit'] = $finalCreditBkash;
                }
            }
        }

        // Add adjustment data to transactions
        foreach ($adjustmentRows as $adjustmentRow) {
            $accountno = $adjustmentRow['accountno'];

            $adjusmentin = $adjustmentRow['AdjustmentIn'];
            $adjustmentout = $adjustmentRow['AdjustmentOut'];
            $topup = $adjustmentRow['Topup'];

            $adjusmentinNagad = $adjustmentRow['AdjustmentIn_Nagad'];
            $adjustmentoutNagad = $adjustmentRow['AdjustmentOut_Nagad'];
            $topupNagad = $adjustmentRow['Topup_Nagad'];

            $adjusmentinBkash = $adjustmentRow['AdjustmentIn_Bkash'];
            $adjustmentoutBkash = $adjustmentRow['AdjustmentOut_Bkash'];
            $topupBkash = $adjustmentRow['Topup_Bkash'];

            // Loop through transactions and add adjustment data to corresponding fields
            foreach ($transactions as &$transaction) {
                if ($transaction['accountno'] == $accountno) {
                    $transaction['finalAdjustmentIn'] += $adjusmentin;
                    $transaction['finalAdjustmentOut'] += $adjustmentout;
                    $transaction['finalTopUp'] += $topup;
                    
                    // Fixed credit calculation for NAGAD - corrected variable assignment
                    $finalCreditNagad = $transaction['finalNagadCredit'] + $adjusmentinNagad - $adjustmentoutNagad + $topupNagad;
                    $transaction['finalNagadCredit'] = $finalCreditNagad;
                    
                    // Fixed credit calculation for BKASH - corrected variable assignment
                    $finalCreditBkash = $transaction['finalBkashCredit'] + $adjusmentinBkash - $adjustmentoutBkash + $topupBkash;
                    $transaction['finalBkashCredit'] = $finalCreditBkash;
                }
            }
        }
    }




    // foreach ($transactions as $trans) {
    //   $agent = $trans['v_agent'];
    //   $totalCashOut = $trans['totalCashOut'];
    //   $totalCashIn = $trans['totalCashIn'];
    //   $totalCashOutNagad = $trans['totalCashOutNagad'];
    //   $totalCashInNagad = $trans['totalCashInNagad'];
    //   $totalCashOutBkash = $trans['totalCashOutBkash'];
    //   $totalCashInBkash = $trans['totalCashInBkash'];
    //   $totalAdjustmentInNagad = $trans['totalAdjustmentInNagad'];
    //   $totalAdjustmentInBkash = $trans['totalAdjustmentInBkash'];
    //   $totalAdjustmentOutNagad = $trans['totalAdjustmentOutNagad'];
    //   $totalAdjustmentOutBkash = $trans['totalAdjustmentOutBkash'];
    //   $totalTopUpNagad = $trans['totalTopUpNagad'];
    //   $totalTopUpBkash = $trans['totalTopUpBkash'];

    //   $finalBkashCredit = 0;
    //   $finalNagadCredit = 0;

    // $queryGetBeginningBkash = "SELECT n_lastbalance FROM tbl_transaction_per_five_minute WHERE v_bankcode = 'BKASH' AND v_agent = '$agent' ORDER BY d_insert DESC LIMIT 1";
    // $stmt = $conn->prepare($queryGetBeginningBkash);
    // $stmt->execute();
    // $beginningBalanceBkash = $stmt->fetch(PDO::FETCH_ASSOC);
    // if ($beginningBalanceBkash) {
    //   $finalBkashCredit = $beginningBalanceBkash['n_lastbalance'];
    // }

    // $queryGetBeginningNagad = "SELECT n_lastbalance FROM tbl_transaction_per_five_minute WHERE v_bankcode = 'NAGAD' AND v_agent = '$agent' ORDER BY d_insert DESC LIMIT 1";
    // $stmt = $conn->prepare($queryGetBeginningNagad);
    // $stmt->execute();
    // $beginningBalanceNagad = $stmt->fetch(PDO::FETCH_ASSOC);
    // if ($beginningBalanceNagad) {
    //   $finalNagadCredit = $beginningBalanceNagad['n_lastbalance'];
    // }

    // $queryGetBeginning = "SELECT v_agentusername, IFNULL(n_bkashcredit, 0) AS n_bkashcredit, IFNULL(n_nagadcredit, 0) AS n_nagadcredit FROM tbl_beginning_balance_tmp WHERE d_date = '$yesterday' AND v_agentusername = '$agent'";
    // $stmt = $conn->prepare($queryGetBeginning);
    // $stmt->execute();
    // $beginningBalance = $stmt->fetch(PDO::FETCH_ASSOC);
    // if ($beginningBalance) {
    //   $bkashCredit = $beginningBalance['n_bkashcredit'];
    //   $nagadCredit = $beginningBalance['n_nagadcredit'];
    // } else {
    //   $bkashCredit = 0;
    //   $nagadCredit = 0;
    // }

    // $finalBkashCredit = ($bkashCredit - $totalCashOutBkash) + $totalCashInBkash + $totalAdjustmentInBkash - $totalAdjustmentOutBkash + $totalTopUpBkash;
    // $finalNagadCredit = ($nagadCredit - $totalCashOutNagad) + $totalCashInNagad + $totalAdjustmentInNagad - $totalAdjustmentOutNagad + $totalTopUpNagad;

    // $finalAdjustmentIn = $totalAdjustmentInNagad + $totalAdjustmentInBkash;
    // $finalAdjustmentOut = $totalAdjustmentOutNagad + $totalAdjustmentOutBkash;
    // $finalTopUp = $totalTopUpNagad + $totalTopUpBkash;

    // array_push($records, array(
    //   "date" => $dateNow,
    //   "agentUsername" => $agent,
    //   "finalNagadCredit" => $finalNagadCredit,
    //   "finalBkashCredit" => $finalBkashCredit,
    //   "totalCashOut" => $totalCashOut,
    //   "totalCashIn" => $totalCashIn,
    //   "totalCashOutNagad" => $totalCashOutNagad,
    //   "totalCashInNagad" => $totalCashInNagad,
    //   "totalCashOutBkash" => $totalCashOutBkash,
    //   "totalCashInBkash" => $totalCashInBkash,
    //   "finalAdjustmentIn" => $finalAdjustmentIn ?? 0,
    //   "finalAdjustmentOut" => $finalAdjustmentOut ?? 0,
    //   "finalTopUp" => $finalTopUp ?? 0
    // ));
    // }

    $result = [
        'status' => 'success',
        'message' => '',
        'records' => $transactions
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

<?php
session_start();
require_once 'require_files.php';

if ($_SESSION['emoney_valid'] != true) {
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if (stripos($_SERVER["CONTENT_TYPE"], "application/json") == 0) {
    $param_POST = json_decode(file_get_contents("php://input"));
}

/*-- DECRYPT --*/
$data = (empty($_POST['data'])) ? trim($param_POST->data) : trim($_POST['data']);
$Public_Key = substr($data, 0, 16);
$dec_data = CryptoAES::decrypt(substr($data, 16), $Public_Key . $Private_Key, 256);
$data = json_decode($dec_data);
/*-------------*/

// 🗓️ Ambil parameter tanggal
$dateFrom = explode(" ", $data->datefrom)[0];
$dateTo   = explode(" ", $data->dateto)[0];
$merchantcode = $data->merchantcode ?? 'ALL';
$groupBy = $data->groupBy ?? '';
$groupByDay = strtolower($groupBy) === 'day';

try {
    $conn = new PDO("mysql:host=$MySQL_SERVER;dbname=$MySQL_DB;charset=utf8", $MySQL_USER, $MySQL_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 🔹 Base query untuk transaction dan transaction_history
    $baseQuery = "
        SELECT 
            v_merchantcode" . ($groupByDay ? ",
            DATE(d_completedate) AS day" : "") . ",
            SUM(CASE WHEN v_transactiontype = 'D' THEN n_amount ELSE 0 END) AS total_deposit,
            SUM(CASE WHEN v_transactiontype = 'W' THEN n_amount ELSE 0 END) AS total_withdraw,
            SUM(CASE WHEN v_transactiontype = 'D' THEN 1 ELSE 0 END) AS count_deposit,
            SUM(CASE WHEN v_transactiontype = 'W' THEN 1 ELSE 0 END) AS count_withdraw
        FROM transaction
        WHERE v_status = '0'
          AND DATE(d_completedate) BETWEEN :dateFrom AND :dateTo
    ";

    if (strtoupper($merchantcode) != 'ALL') {
        $baseQuery .= " AND v_merchantcode = :merchantcode ";
    }

    $baseQuery .= $groupByDay
        ? " GROUP BY v_merchantcode, DATE(d_completedate) "
        : " GROUP BY v_merchantcode ";

    $stmt = $conn->prepare($baseQuery);
    $stmt->bindValue(':dateFrom', $dateFrom);
    $stmt->bindValue(':dateTo', $dateTo);
    if (strtoupper($merchantcode) != 'ALL') {
        $stmt->bindValue(':merchantcode', $merchantcode);
    }
    $stmt->execute();
    $rows1 = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 Ulangi untuk table transaction_history
    $historyQuery = str_replace("FROM transaction", "FROM transaction_history", $baseQuery);
    $stmt2 = $conn->prepare($historyQuery);
    $stmt2->bindValue(':dateFrom', $dateFrom);
    $stmt2->bindValue(':dateTo', $dateTo);
    if (strtoupper($merchantcode) != 'ALL') {
        $stmt2->bindValue(':merchantcode', $merchantcode);
    }
    $stmt2->execute();
    $rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // 🔹 Gabungkan hasil transaction + history
    $combined = [];

    foreach ($rows1 as $row) {
        $merchant = $row['v_merchantcode'];
        $day = $groupByDay ? $row['day'] : null;
        $key = $groupByDay ? ($merchant . '|' . $day) : $merchant;
        $combined[$key] = [
            'merchantcode' => $merchant,
            'total_deposit' => (float)$row['total_deposit'],
            'total_withdraw' => (float)$row['total_withdraw'],
            'count_deposit' => (int)$row['count_deposit'],
            'count_withdraw' => (int)$row['count_withdraw']
        ];
        if ($groupByDay) {
            $combined[$key]['day'] = $day;
        }
    }

    foreach ($rows2 as $row) {
        $merchant = $row['v_merchantcode'];
        $day = $groupByDay ? $row['day'] : null;
        $key = $groupByDay ? ($merchant . '|' . $day) : $merchant;
        if (!isset($combined[$key])) {
            $combined[$key] = [
                'merchantcode' => $merchant,
                'total_deposit' => 0,
                'total_withdraw' => 0,
                'count_deposit' => 0,
                'count_withdraw' => 0
            ];
            if ($groupByDay) {
                $combined[$key]['day'] = $day;
            }
        }
        $combined[$key]['total_deposit'] += (float)$row['total_deposit'];
        $combined[$key]['total_withdraw'] += (float)$row['total_withdraw'];
        $combined[$key]['count_deposit'] += (int)$row['count_deposit'];
        $combined[$key]['count_withdraw'] += (int)$row['count_withdraw'];
    }

    // 🔹 Format array jadi indexed (bukan associative)
    $result = array_values($combined);

    echo json_encode([
        'status' => 'ok',
        'message' => '',
        'records' => $result
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'no',
        'message' => $e->getMessage(),
        'records' => []
    ]);
}

$conn = null;
?>

app.controller("depositDashboardCtrl", [
  "$scope",
  "$http",
  "$interval",
  function ($scope, $http, $interval) {
    $scope.agentHbDisconnect = "";
    $scope.deposit = "";
    $scope.depositPending = "";
    $scope.depositNeedAttention = "";
    $scope.nagadDeposit = "";
    $scope.nagadDepositPending = "";
    $scope.nagadDepositNeedAttention = "";
    $scope.bkashDeposit = "";
    $scope.bkashDepositPending = "";
    $scope.bkashDepositNeedAttention = "";
    $scope.lastDeposit = "";
    $scope.pending5Minute = "";
    $scope.avg_duration = "";
    $scope.averageDP = "";
    $scope.avg_duration = "";
    $scope.avg_minutes = "";
    $scope.avg_seconds = "";

    $scope.getDataList = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/depositDashboard.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          console.log(response.data);
          if (response.data.status == "ok") {
            console.log(response.data.records[0]);
            records = response.data.records[0];
            $scope.agentHbDisconnect = records.resHBDisconnected.total;
            $scope.deposit = records.resDeposit.total;
            $scope.depositPending = records.resDepositPending.total;
            $scope.depositNeedAttention = records.resDepositNeedAttention.total;
            $scope.nagadDeposit = records.resNagadDeposit.total;
            $scope.nagadDepositPending = records.resNagadDepositPending.total;
            $scope.nagadDepositNeedAttention = records.resNagadDepositNeedAttention.total;
            $scope.bkashDeposit = records.resBkashDeposit.total;
            $scope.bkashDepositPending = records.resBkashDepositPending.total;
            $scope.bkashDepositNeedAttention = records.resBkashDepositNeedAttention.total;
            $scope.lastDeposit = records.resLastDeposit.d_completedate;
            $scope.pending5Minute = records.resPending5Minutes.total;
            $scope.averageDP = records.resAverageDPNagad.avg_duration;
            $scope.averageDPBkash = records.resAverageDPBkash.avg_duration;
            $scope.avg_minutes = Math.floor($scope.averageDP / 60);
            $scope.avg_seconds = Math.round($scope.averageDP % 60);
            $scope.avg_minutesBkash = Math.floor($scope.averageDPBkash / 60);
            $scope.avg_secondsBkash = Math.round($scope.averageDPBkash % 60);
          } else {
            console.log("error: ", response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.refresh = function () {
      $scope.getDataList();
    };
    $scope.init = function () {
      $scope.getDataList();
      $interval($scope.refresh, 5000);
    };

    $scope.init();
  },
]);

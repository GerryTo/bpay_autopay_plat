app.controller("withdrawDashboardCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$uibModal",
  "$interval",
  "$rootScope",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    $uiGridConstants,
    $uibModal,
    $interval,
    $rootScope
  ) {
    $scope.statusService = "";
    $scope.agentHbDisconnect = "";
    $scope.agentFailedWithdraw2 = "";
    $scope.withdrawTBP = "";
    $scope.withdrawCompleted = "";
    $scope.withdrawCompleted2M = "";
    $scope.bkashWithdrawTBP = "";
    $scope.bkashAgentAFW = "";
    $scope.bkashLowLimit = "";
    $scope.bkashWithdrawPending = "";
    $scope.bkashWithdrawAssigned = "";
    $scope.bkashWithdrawNA = "";
    $scope.nagadWithdrawTBP = "";
    $scope.nagadAgentAFW = "";
    $scope.nagadLowLimit = "";
    $scope.nagadWithdrawPending = "";
    $scope.nagadWithdrawAssigned = "";
    $scope.nagadWithdrawNA = "";
    $scope.pending5Minute = "";
    $scope.withdrawAttempt1 = "";
    $scope.withdrawAttempt2 = "";
    $scope.lastWD = "";
    $scope.averageWD = "";
    $scope.avg_duration = "";
    $scope.avg_minutes = "";
    $scope.avg_seconds = "";
    $scope.pendingWd = "";
    $scope.nagadA = "";
    $scope.bkashA = "";

    $scope.pending = function () {
      $state.go("appium-withdraw-transaction-new", {
        filterStatus: "AUTOMATION FAILED",
      });
    };
    $scope.pending1 = function () {
      $state.go("appium-withdraw-transaction-new", { filterStatus: "pending" });
    };

    $scope.getDataList = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawDashboard.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          console.log(response.data.records[0]);
          if (response.data.status == "ok") {
            console.log(response.data.records[0]);
            records = response.data.records[0];
            $scope.agentHbDisconnect = records.resHBDisconnected.total;
            $scope.agentFailedWithdraw2 = records.resFailed2Times.total;
            $scope.withdrawTBP = records.resWithdrawTBP.total;
            $scope.withdrawCompleted = records.resWithdrawCompleted.total;
            // $scope.withdrawCompleted2M = records.resWithdrawComplete2M.total;
            $scope.bkashWithdrawTBP = records.resBkashWithdrawTBP.total;
            $scope.bkashAgentAFW = records.resBkashAFW.total;
            $scope.bkashLowLimit = records.resBkashLow.total;
            $scope.bkashWithdrawPending = records.resBkashPending.total;
            $scope.bkashWithdrawAssigned = records.resBkashAssigned.total;
            $scope.bkashWithdrawNA = records.resBkashNeedAttention.total;
            $scope.nagadWithdrawTBP = records.resNagadWithdrawTBP.total;
            $scope.nagadAgentAFW = records.resNagadAFW.total;
            $scope.nagadLowLimit = records.resNagadLow.total;
            $scope.nagadWithdrawPending = records.resNagadPending.total;
            $scope.nagadWithdrawAssigned = records.resNagadAssigned.total;
            $scope.nagadWithdrawNA = records.resNagadNeedAttention.total;
            $scope.pending5Minute = records.resPending5Minutes.total;
            $scope.withdrawAttempt1 = records.resWithdrawAttempt1.total;
            $scope.withdrawAttempt2 = records.resWithdrawAttempt2.total;
            $scope.lastWD = records.resLastWD.d_completedate;
            $scope.averageWD = records.resAverageWDNagad.avg_duration;
            $scope.averageWDBkash = records.resAverageWDBkash.avg_duration;
            $scope.avg_minutes = Math.floor($scope.averageWD / 60);
            $scope.avg_seconds = Math.round($scope.averageWD % 60);
            $scope.avg_minutesBkash = Math.floor($scope.averageWDBkash / 60);
            $scope.avg_secondsBkash = Math.round($scope.averageWDBkash % 60);
            $scope.withdrawPending = records.resWdPending.total;
            $scope.nagadA = records.resNagadA.total;
            $scope.bkashA = records.resBkashA.total;
          } else {
            console.log("error: ", response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.getStatusService = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/get_status_serviceautoassign.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          console.log(response.data);
          if (response.data.status.toLowerCase() == "ok") {
            $scope.statusService = response.data.records[0].v_servicestatus;
          } else {
            alert(response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.refresh = function () {
      $scope.getDataList();
      $scope.getStatusService();
    };
    $scope.init = function () {
      $scope.getDataList();
      // $scope.getStatusService();
      $interval($scope.refresh, 10000);
    };

    $scope.init();
  },
]);

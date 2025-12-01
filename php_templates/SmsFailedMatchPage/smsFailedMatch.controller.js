app.controller("smsFailedMatchCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$uibModal",
  "$interval",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $uibModal,
    $interval
  ) {
    //----datepicker----

    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      //minDate: new Date(),
      startingDay: 1,
    };
    $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };
    $scope.popup2 = {
      opened: false,
    };
    $scope.open2 = function () {
      $scope.popup2.opened = true;
    };
    $scope.filter = {
      fromdate: new Date(),
      todate: new Date(),
      type: "2",
      user: "",
      history: false,
    };
    $scope.phoneUsers = [];
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSelectionBatchEvent: false,
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "sms-failed-match.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          width: 120,
          aggregationType: uiGridConstants.aggregationTypes.count,
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        { name: "Timestamp", field: "insert", width: 120 },
        { name: "Merchant", field: "merchantcode", width: 120 },
        { name: "TransactionID/Reference", field: "transactionid", width: 120 },
        { name: "Bank", field: "bankcode", width: 120 },
        { name: "Trx ID", field: "trxid", width: 120 },
        { name: "Customer Phone", field: "phonenumber", width: 120 },
        {
          name: "Amount",
          field: "amount",
          type: "number",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          width: 120,
        },
        { name: "Bank (SMS)", field: "smsbank", width: 120 },
        { name: "Timestamp (SMS)", field: "smsinsert", width: 120 },
        { name: "Customer Phone (SMS)", field: "customerphone", width: 120 },
        { name: "Service Center (SMS)", field: "servicecenter", width: 120 },
        { name: "Trans. Type", field: "transactionType", width: 80 },
        {
          name: "Amount (SMS)",
          field: "smsamount",
          type: "number",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          width: 120,
        },
        { name: "actual agent", field: "actualagent", width: 200 },
        { name: "Reason", field: "reason", width: 200 },
        {
          name: "Suspected Reason",
          field: "suspectedReason",
          width: 200,
          cellTooltip: function (row, col) {
            return row.entity.suspectedReason;
          },
        },
        { name: "Memo", field: "memo", width: 200 },
        { name: "Matching Detail", field: "memo3", width: 200 },
        { name: "Reason Matching", field: "flag3", width: 200 },
        {
          name: "Action",
          field: "securitycode",
          width: 150,
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm"  ng-click="grid.appScope.match(row.entity)">Match</button> <button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.futuretrxid == \'\'" ng-click="grid.appScope.expire(row.entity)">Expire</button>',
        },

        /*{
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="false" ng-click="grid.appScope.edit(row.entity)">'+$scope.globallang.proceed+'</button>' 
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>'
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.ibft(row.entity)" ng-show="row.entity.allowresend == \'1\' ">Resend</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.id)" ng-show="row.entity.status == \'Order need to check\'">Success</button>'
                    +' <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\' || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'">Receipt</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.TimeOut(row.entity.id)" ng-show="false">Order need to check</button>' , 
                    width:260
            }*/
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.rowsSelected = $scope.gridApi.selection.getSelectedRows();
          $scope.countRows = $scope.rowsSelected.length;
          if ($scope.countRows > 20) {
            row.setSelected(false); // Remove selection for the current row
          }
        });
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { datefrom: from, dateto: to, history: $scope.filter.history };

      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/smsFailedMatch_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(response.data.data);
          var data = response.data.data;
          console.log(response);
          if (data.status == "ok") {
            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.status);
        }
      );
    };

    $scope.bulkFail = function () {
      var list = $scope.gridApi.selection.getSelectedRows();
      if (list.length == 0) {
        alert("Please choose transaction to fail");
        return false;
      }

      if (
        confirm("are your sure want to FAIL " + list.length + " transaction?")
      ) {
        $scope.gridIsLoading = true;
        var jsonData = CRYPTO.encrypt({ list: list });

        $http({
          method: "POST",
          url: webservicesUrl + "/smsFailedMatch_bulkFail.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = response.data;

            if (data.status.toLowerCase() == "ok") {
              alert("Failing is success");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
          }
        );
      }
    };

    $scope.bulkSuccess = function () {
      var list = $scope.gridApi.selection.getSelectedRows();
      if (list.length == 0) {
        alert("Please choose transaction to success");
        return false;
      }

      if (
        confirm(
          "are your sure want to SUCCESS " + list.length + " transaction?"
        )
      ) {
        $scope.gridIsLoading = true;
        var jsonData = CRYPTO.encrypt({ list: list });

        $http({
          method: "POST",
          url: webservicesUrl + "/smsFailedMatch_bulkSuccess.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = response.data;

            if (data.status.toLowerCase() == "ok") {
              alert("Bulk Success is success");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
          }
        );
      }
    };

    $scope.expire = function (dataParam) {
      if (confirm("Are you sure want to expire this SMS?")) {
        var data = {
          amount: dataParam.smsamount,
          bank: dataParam.smsbank,
          trxid: dataParam.trxid,
          phonenumber: dataParam.customerphone,
        };

        var jsonData = CRYPTO.encrypt(data);
        $http({
          method: "POST",
          url: webservicesUrl + "/smsLog_expireSms.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              alert("Success!");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            console.log(response);
          }
        );
      }
    };

    $scope.match = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/TransactionSuggestionModal/TransactionSuggestionModal.template.html",
        controller: "TransactionSuggestionModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              amount: dataParam.smsamount,
              bank: dataParam.smsbank,
              trxid: dataParam.trxid,
              phonenumber: dataParam.customerphone,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var data = {
            futuretrxid: returnValue.futuretrxid,
            amount: dataParam.amount,
            bank: dataParam.bankcode,
            trxid: dataParam.trxid,
            phonenumber: dataParam.customerphone,
          };

          console.log(data);

          var jsonData = CRYPTO.encrypt(data);
          $http({
            method: "POST",
            url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Success!");
                $scope.getListData();
              } else {
                alert(data.message);
              }
            },
            function myError(response) {
              console.log(response);
            }
          );
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      // $scope.getPhoneUserList();
    };
    $scope.init();
  },
]);

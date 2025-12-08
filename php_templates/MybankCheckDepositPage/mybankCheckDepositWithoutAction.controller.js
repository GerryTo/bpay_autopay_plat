app.controller("mybankCheckDepositWithoutActionCtrl", [
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
    //$scope.products = [];
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
    };

    $scope.gridIsLoading = false;

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
      exporterExcelFilename: "mybank-check-deposit.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Agent",
          field: "agent",
          width: 200,
          aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Bank",
          field: "bank",
          width: 100,
          // aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Total Resubmit Not Match",
          field: "totalResubmitNotMatch",
          width: 200,
          aggregationType: uiGridConstants.aggregationTypes.sum,
        },
        {
          name: "Transaction Match",
          field: "totalResubmitMatch",
          width: 200,
          aggregationType: uiGridConstants.aggregationTypes.sum,
        },
        {
          name: "Is Recrawling",
          field: "isCheckDeposit",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          cellTemplate: `<div class="ui-grid-cell-contents">{{ COL_FIELD == 1 ? 'Y' : 'N' }}</div>`,
        },
        {
          name: "Last Check",
          field: "lastCheckDeposit",
          width: 200,
        },
        {
          name: "Action",
          field: "merchantcode",
          cellTemplate:
            '<button type="button" class="btn btn-danger btn-sm" ng-click="grid.appScope.DetailCheckDeposit(row.entity)">Trx not found</button>',
          width: 260,
        },
        /*{
                    name: 'Action', field: 'securitycode', width:150, 
                    cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.futuretrxid == \'\'" ng-disabled="row.entity.disabled ==\'1\'" ng-click="grid.appScope.match(row.entity)">Match</button> <button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.futuretrxid == \'\'" ng-click="grid.appScope.expire(row.entity)">Expire</button>'
                },*/
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        // gridApi.selection.on.rowSelectionChanged($scope, function (row) {
        //   $scope.rowsSelected = $scope.gridApi.selection.getSelectedRows();
        //   $scope.countRows = $scope.rowsSelected.length;
        //   if ($scope.countRows > 50) {
        //     row.setSelected(false); // Remove selection for the current row
        //   }
        // });
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { from: from, to: to };
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/mybankCheckDeposit_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
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

    $scope.checkLive = function (data) {
      return $http({
        method: "POST",
        url: webservicesUrl + "/check_automation_live.php",
        data: { data: { phoneNumber: data.phonenumber, bankCode: data.bank } },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          if (response.data.status === "ok" && response.data.records) {
            return true;
          } else {
            return false;
          }
        },
        function myError(response) {
          alert(response.data.message);
          return false;
        }
      );
    };

    $scope.DetailCheckDeposit = function (dataParam) {
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/DetailCheckDeposit/DetailCheckDepositModal.template.html?v=2",
        controller: "DetailCheckDepositModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              agent: dataParam.agent,
              bank: dataParam.bank,
              dateFrom: from,
              dateTo: to,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var params = {
            futuretrxid: dataParam.futuretrxid,
            id: returnValue.id,
          }; // id : array()

          var jsonData = CRYPTO.encrypt(params);
          $http({
            method: "POST",
            url: webservicesUrl + "/depositQueue_matchedMutasi.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Mutasi Matching Success!");
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

    $scope.checkDeposit = function (data, status) {
      $scope.gridIsLoading = true;
      if (data.isCheckDeposit === "1" && status === 1) {
        alert("Please stop for checking deposit before check again !!!");
        $scope.getListData();
        return;
      }

      $scope.checkLive(data).then(function (isOnline) {
        console.log(isOnline);
        if (!isOnline) {
          alert("Automation is offline, please turn on and try again");
          $scope.getListData();
          return;
        }

        var jsonData = {
          agent: data.agent,
          bank: data.bank,
          status: status,
        };

        $http({
          method: "POST",
          url: webservicesUrl + "/setCheckDepositOn.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            if (response.data.status == "ok") {
              alert("SUCCESS!");
              $scope.getListData();
              $scope.gridIsLoading = false;
            }
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response);
          }
        );
      });
    };

    $scope.refresh = function () {
      $scope.getListData();
    };
  },
]);

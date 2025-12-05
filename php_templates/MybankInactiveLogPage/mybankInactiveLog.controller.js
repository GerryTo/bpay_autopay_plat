app.controller("mybankInactiveLogCtrl", [
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
      exporterExcelFilename: "report-resubmit-without-automation.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Date Insert",
          field: "d_insert",
          width: 200,
          aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Agent",
          field: "v_agent",
          width: 200,
          // aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Bank",
          field: "v_bankcode",
          width: 200,
          // aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Status",
          field: "v_action",
          width: 200,
        }
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

      var data = {  };
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/mybankInactiveLog_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(response.data.data);
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
            // for (var i = 0; i < data.records.length; i++) {
            //   data.records[i].message = decodeURIComponent(
            //     data.records[i].message
            //   );
            //   data.records[i].from = decodeURIComponent(data.records[i].from);
            // }

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

    $scope.refresh = function () {
      $scope.getListData();
    };
  },
]);

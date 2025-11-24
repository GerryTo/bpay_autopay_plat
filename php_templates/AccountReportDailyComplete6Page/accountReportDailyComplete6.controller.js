app.controller("accountReportDailyComplete6Ctrl", [
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
  
      var maxDate = new Date();
      maxDate.setDate(maxDate.getDate() - 1);
      $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: "yy",
        maxDate: maxDate,
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
        fromdate: maxDate,
        todate: maxDate,
      };
      //------------------
  
      //$scope.products = [];
      $scope.gridIsLoading = false;
      $scope.getHeight = function () {
        return window.innerHeight - 180;
      };
  
      $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableGrouping: false,
        enableFiltering: true,
        enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: "balance-diff.xlsx",
        exporterExcelSheetName: "Sheet1",
        rowTemplate: "templates/rowTemplate.html",
        columnDefs: [
          { name: "Date", field: "date", width: 100 },
          { name: "Bank", field: "bankCode" },
          { name: "Account No", field: "accountNo" },
          { name: "Account Name", field: "accountName" },
          {
            name: "Deposit",
            field: "deposit",
            cellFilter: "number: " + decimalDigit,
            cellClass: "grid-alignright",
            type: "number",
            aggregationType: uiGridConstants.aggregationTypes.sum,
            footerCellTemplate:
              '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          },
          {
            name: "Withdraw",
            field: "withdraw",
            cellFilter: "number: " + decimalDigit,
            cellClass: "grid-alignright",
            type: "number",
            aggregationType: uiGridConstants.aggregationTypes.sum,
            footerCellTemplate:
              '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          },
        ],
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
        },
        data: [],
      };
  
      $scope.getListData = function () {
        $scope.gridIsLoading = true;
  
        var fromdate = $scope.convertJsDateToString($scope.filter.fromdate);
        var todate = $scope.convertJsDateToString($scope.filter.todate);
  
        var data = {
          fromdate: fromdate,
          todate: todate,
        };
        var jsonData = CRYPTO.encrypt(data);
  
        $http({
          method: "POST",
          url: webservicesUrl + "/getAccountReportBetweenCompleteDate6.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            console.log(data);
            if (data.status.toLowerCase() == "ok") {
              $scope.gridOptions.data = data.records;
            } else {
              alert(data.message);
            }
            console.log(data.records);
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
  
      $scope.init = function () {
        // $scope.getListData();
      };
      $scope.init();
    },
  ]);
  
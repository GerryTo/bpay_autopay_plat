app.controller('smsLogByAgentReportCTRL', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {
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
  $scope.filter = {
    date: maxDate,
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
        name: "Cash In",
        field: 'cashIn',
        cellFilter: "number: " + decimalDigit,
        cellClass: "grid-alignright",
        type: "number",
        aggregationType: uiGridConstants.aggregationTypes.sum,
        footerCellTemplate:
          '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
      },
      {
        name: "Deposit", 
        field: 'deposit',
        cellFilter: "number: " + decimalDigit,
        cellClass: "grid-alignright",
        type: "number",
        aggregationType: uiGridConstants.aggregationTypes.sum,
        footerCellTemplate:
          '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
      },
      {
        name: "B2B Received", 
        field: 'received',
        cellFilter: "number: " + decimalDigit,
        cellClass: "grid-alignright",
        type: "number",
        aggregationType: uiGridConstants.aggregationTypes.sum,
        footerCellTemplate:
          '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
      },
      {
        name: "B2b Send",
        field: 'send',
        cellFilter: "number: " + decimalDigit,
        cellClass: "grid-alignright",
        type: "number",
        aggregationType: uiGridConstants.aggregationTypes.sum,
        footerCellTemplate:
          '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
      },


    //   { name: "Account Name", field: "accountName" },
    //   {
    //     name: "Deposit",
    //     field: "deposit",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    //   {
    //     name: "Withdraw",
    //     field: "withdraw",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    //   {
    //     name: "Adjustment Deposit",
    //     field: "depositAdjustment",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    //   {
    //     name: "Adjustment Withdraw",
    //     field: "withdrawAdjustment",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    //   {
    //     name: "Total Deposit",
    //     field: "totalDeposit",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    //   {
    //     name: "Total Withdraw",
    //     field: "totalWithdraw",
    //     cellFilter: "number: " + decimalDigit,
    //     cellClass: "grid-alignright",
    //     type: "number",
    //     aggregationType: uiGridConstants.aggregationTypes.sum,
    //     footerCellTemplate:
    //       '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
    //   },
    ],
    onRegisterApi: function (gridApi) {
      $scope.gridApi = gridApi;
    },
    data: [],
  };

  $scope.getListData = function () {
    $scope.gridIsLoading = true;

    var date = $scope.convertJsDateToString($scope.filter.date);

    var data = {
      date: date,
    };
    var jsonData = CRYPTO.encrypt(data);

    $http({
      method: "POST",
      url: webservicesUrl + "/getSmsLogByAgentReport.php",
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
}]); 
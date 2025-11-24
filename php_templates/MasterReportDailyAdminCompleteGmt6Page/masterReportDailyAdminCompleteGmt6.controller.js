app.controller("masterReportDailyAdminCompleteGmt6Ctrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  function ($state, $scope, $http, $timeout, uiGridConstants) {
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.dataToday = [];
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
      merchantCode: "ALL",
    };
    $scope.merchantList = [];

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      showGridFooter: true,
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      exporterExcelFilename: "ReportEmoney.xlsx",
      exporterPdfMaxGridWidth: 500,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Merchant Code", field: "merchantcode", width: 150 },
        { name: "Date", field: "date", width: 100 },
        {
          name: "Opening Balance",
          field: "opening_balance",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Total Deposit",
          field: "total_deposit",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Total Withdrawal",
          field: "total_withdrawal",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Bropay Fee",
          field: "total_fee",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        // {
        //   name: "Commission Fee",
        //   field: "total_comfee",
        //   cellFilter: "number: " + decimalDigit,
        //   cellClass: "grid-alignright",
        //   type: "number",
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        //   footerCellTemplate:
        //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        // },
        {
          name: "Total Top Up / Adj Debit",
          field: "total_topup",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Total Settlement / Adj Credit",
          field: "total_settlement",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        // {
        //   name: "Deposit Adjustment",
        //   field: "trans_adjustin",
        //   cellFilter: "number: " + decimalDigit,
        //   cellClass: "grid-alignright",
        //   type: "number",
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        //   footerCellTemplate:
        //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        // },
        // {
        //   name: "Withdrawal Adjustment",
        //   field: "trans_adjustout",
        //   cellFilter: "number: " + decimalDigit,
        //   cellClass: "grid-alignright",
        //   type: "number",
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        //   footerCellTemplate:
        //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        // },
        // {
        //   name: "Fee Adjustment",
        //   field: "trans_adjustfee",
        //   cellFilter: "number: " + decimalDigit,
        //   cellClass: "grid-alignright",
        //   type: "number",
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        //   footerCellTemplate:
        //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        // },
        {
          name: "Closing Balance",
          field: "closing_balance",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Count Deposit",
          field: "deposit_count",
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Count Withdraw",
          field: "withdraw_count",
          cellFilter: "number: 0",
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

    $scope.getMerchantList = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.merchantList = data.records;
            data.records.push({ merchantcode: "All-Not-MerchantDemo" });
            if (data.records.length > 0) {
              $scope.filter.merchantCode = data.records[0].merchantcode;
            }
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.getListData = function () {
      //console.log("GetListData");
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = {
        datefrom: from,
        dateto: to,
        merchant: $scope.filter.merchantCode,
      };
      var jsonData = CRYPTO.encrypt(data);

      $scope.gridIsLoading = true;

      $http({
        method: "POST",
        // url: webservicesUrl + "/getReportAdmin.php",
        url: webservicesUrl + "/admin_reportDaily_complete_gmt6.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        timeout: 2 * 60 * 1000,
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;

          console.log(data);
          if (data.status.toLowerCase() == "ok") {
            data.records = data.records;

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
      $scope.getMerchantList();
    };
    $scope.init();
  },
]);

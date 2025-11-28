app.controller("transactionRejectedCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$stateParams",
  "$uibModal",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal
  ) {
    //$scope.products = [];
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    }
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };
    $scope.Balance = {};
    $scope.Summary = {
      pendingDB: 0,
      pendingCR: 0,
      DB: 0,
      CR: 0,
      fee: 0,
    };
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      //minDate: new Date(),
      startingDay: 1,
    };

    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "transaction-by-id.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          aggregationType: uiGridConstants.aggregationTypes.count,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        { name: "Date", field: "insert", width: 150 },
        { name: "Complete Date", field: "completedate", width: 150 },
        { name: "Merchant Code", field: "merchantcode", width: 100 },
        { name: "Customer Code", field: "customercode", width: 180 },
        { name: "CCY", field: "ccy", visible: false },
        {
          name: "Bank",
          field: "bankcode",
          sort: { direction: "asc" },
          filter: { condition: uiGridConstants.filter.EXACT },
          width: 100,
        },
        {
          name: "Debit",
          field: "DB",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        {
          name: "Credit",
          field: "CR",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "IP", field: "ip", visible: false },
        { name: "Trans Type", field: "transactiontype", width: 100 },
        { name: "Status", field: "status", width: 120 },
        {
          name: "Callback Status",
          field: "callbackresponse",
          width: 150,
          cellTooltip: function (row, col) {
            return row.entity.callbackresponse;
          },
        },
        { name: "Account Src", field: "accountsrc", visible: false },
        {
          name: "Fee",
          field: "fee",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "Notes", field: "notes", width: 150 },
        { name: "Notes 2", field: "notes2", width: 150 },
        { name: "Notes 3", field: "notes3", width: 150 },
        { name: "Sms Phone", field: "phonenumber", width: 150 },
        { name: "Sms Agent", field: "user", width: 150 },
        //{ name: 'Actual Transaction Date', field: 'notesactualdate' , width:150},
        { name: "Trans ID", field: "transactionid", width: 100 },
        { name: "Reference", field: "reference", visible: false },
        { name: "Alias", field: "alias", width: 100 },
        { name: "Acc Source", field: "accountno", width: 100 },
        { name: "Acc Source Name", field: "accountsrcname", width: 100 },
        { name: "Acc Dest", field: "accountdst", width: 100 },
        { name: "Acc Dest Name", field: "accountdstname", width: 100 },
        { name: "Server Name", field: "servername", width: 100 },
        { name: "Server URL", field: "serverurl", width: 100 },
        { name: "dis", field: "disable", visible: false },
        { name: "Receipt ID", field: "notes2", width: 100 },
        { name: "Memo", field: "memo", width: 500 },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    // $scope.getListData = function () {
    //     $scope.gridIsLoading = true;
    //     $http({
    //         method: "POST",
    //         url: webservicesUrl + "/getTransactionRejected.php",
    //         data: { 'data': '' },
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //     }).then(function mySuccess(response) {
    //         $scope.gridIsLoading = false;
    //         var data = CRYPTO.decrypt(response.data.data);
    //         data.records =$scope.urlDecode(data.records);
    //         console.log(data.records);
    //         if (data.status.toLowerCase() == 'ok') {
    //             $scope.gridOptions.data = data.records;
    //         } else {
    //             alert(data.message);
    //         }
    //     }, function myError(response) {
    //         $scope.gridIsLoading = false;
    //         console.log(response.status);
    //     });
    // }
    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getTransactionRejected.php",
        data: { data: '' },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          //$scope.getAccountBalance();
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);

            for (var i = 0, length = data.records.length; i < length; i++) {
              if (
                data.records[i]["transactiontype"] == "D" ||
                data.records[i]["transactiontype"] == "Topup" ||
                data.records[i]["transactiontype"] == "Y" ||
                data.records[i]["transactiontype"] == "I"
              ) {
                data.records[i]["DB"] = data.records[i]["amount"];
                data.records[i]["CR"] = "0";
              } else {
                data.records[i]["CR"] = data.records[i]["amount"];
                data.records[i]["DB"] = "0";
              }
              data.records[i]["fee"] = Number(data.records[i]["fee"]);
            }
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
      $scope.getListData();
    };

    $scope.init();
  },
]);

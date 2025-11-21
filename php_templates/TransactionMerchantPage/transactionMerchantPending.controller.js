app.controller("transactionMerchantPendingCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  function ($state, $scope, $http, $timeout, uiGridConstants) {
    //$scope.products = [];
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };
    $scope.MerchantBalanceNew = {};
    $scope.MerchantBalance = {};

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

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      exporterExcelFilename: "MerchantTransactionPending.xlsx",
      exporterPdfMaxGridWidth: 500,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          aggregationType: uiGridConstants.aggregationTypes.count,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue()}}</div>',
        },
        { name: "Date", field: "timestamp", width: 150 },
        { name: "Original Date", field: "originaldate", width: 150 },
        { name: "Insert Date", field: "insert", width: 150 },
        { name: "Account No", field: "accountno", visible: true },
        { name: "Customer Code", field: "customercode" },
        //{ name: 'CCY', field: 'ccy', visible:false  },
        { name: "Bank", field: "bankcode" },
        {
          name: "Debit",
          field: "DB",
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Credit",
          field: "CR",
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        { name: "IP", field: "ip" },
        { name: "Trans Type", field: "transactiontype" },
        { name: "Status", field: "status" },
        {
          name: "Fee",
          field: "fee",
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        { name: "Notes", field: "notes" },
        { name: "Notes 2", field: "notes2" },
        { name: "Notes 3", field: "notes3" },
        { name: "Trans ID", field: "transactionid" },
        { name: "Reference", field: "reference" },
        // { name: 'Account Dest', field: 'accountdst' },
        // { name: 'Status bank Admin', field: 'bankactive' },
        /*{
                  name: 'Action', field: 'bankAccNo',
                  cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' + $scope.globallang.edit + '</button> <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.delete(row.entity)">' + $scope.globallang.delete + '</button>'
              }*/
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListData = function () {
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { datefrom: from, dateto: to };
      var jsonData = CRYPTO.encrypt(data);
      $scope.MerchantBalance = {};
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getTransactionByMerchantPending.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);

            for (var i = 0, length = data.records.length; i < length; i++) {
              if (
                data.records[i]["transactiontype"] == "D" ||
                data.records[i]["transactiontype"] == "M" ||
                data.records[i]["transactiontype"] == "Y"
              ) {
                data.records[i]["DB"] = data.records[i]["amount"];
                data.records[i]["CR"] = "0";
              } else {
                data.records[i]["CR"] = data.records[i]["amount"];
                data.records[i]["DB"] = "0";
              }
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

    $scope.pending = function (event) {
      $scope.getListDataEvent(event, "9");
    };
    $scope.accepted = function (event) {
      $scope.getListDataEvent(event, "0");
    };
    $scope.failed = function (event) {
      $scope.getListDataEvent(event, "8");
    };
    $scope.allShow = function (event) {
      myTarget = $(event.target);
      $(".subStatus").removeClass("activeSubmenu");
      myTarget.addClass("activeSubmenu");
      $scope.getListData();
    };
    $scope.getListDataEvent = function (event, paramStatus) {
      myTarget = $(event.target);
      $(".subStatus").removeClass("activeSubmenu");
      myTarget.addClass("activeSubmenu");
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { datefrom: from, dateto: to, statusValue: paramStatus };
      var jsonData = CRYPTO.encrypt(data);
      $scope.MerchantBalance = {};
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getTransactionByMerchantPending.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);

          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);

            for (var i = 0, length = data.records.length; i < length; i++) {
              if (
                data.records[i]["transactiontype"] == "D" ||
                data.records[i]["transactiontype"] == "M" ||
                data.records[i]["transactiontype"] == "Y"
              ) {
                data.records[i]["DB"] = data.records[i]["amount"];
                data.records[i]["CR"] = "0";
              } else {
                data.records[i]["CR"] = data.records[i]["amount"];
                data.records[i]["DB"] = "0";
              }
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
    $scope.statusABC = function (event) {
      myTarget = $(event.target);
      $(".subStatus").removeClass("activeSubmenu");
      myTarget.siblings(".subStatus").fadeToggle("slow");
    };
    $scope.init = function () {};
    $scope.init();
  },
]);

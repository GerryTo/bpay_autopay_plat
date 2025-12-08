app.controller("merchantTransactionPerHourCtrl", [
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

    $scope.getHeight = function () {
      return window.innerHeight - 210;
    };

    $scope.MerchantBalanceNew = {};
    $scope.MerchantBalance = {};
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

    $scope.merchantlist = [];
    $scope.filter = {
      fromdate: new Date(),
      todate: new Date(),
      merchantcode: "0",
      history: false,
    };

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      exporterExcelFilename: "MerchantTransaction.xlsx",
      exporterPdfMaxGridWidth: 500,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Date", field: "d_insert", width: 150 },
        { name: "Merchant Code", field: "v_merchantcode", width: 150 },
        {
          name: "Total Trans Bkash", field: "total_transaction_bkash_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue()}}</div>',
        },
        {
          name: "Total Amount Bkash", field: "total_amount_bkash_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },

        {
          name: "Total Trans Nagad", field: "total_transaction_nagad_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
        },
        {
          name: "Total Amount Nagad", field: "total_amount_nagad_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },

        {
          name: "Total Trans Rocket", field: "total_transaction_rocket_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
        },
        {
          name: "Total Amount Rocket", field: "total_amount_rocket_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },

        {
          name: "Total Trans Upay", field: "total_transaction_upay_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
        },
        {
          name: "Total Amount Upay", field: "total_amount_upay_wd", aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListMerchantWithAccount = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getMerchantWithAccount.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          //console.log(data);
          if (data.status.toLowerCase() == "ok") {
            $scope.merchantlist = data.records;
            console.log($scope.merchantlist);
            //$scope.changeMerchant();
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
      var from = $scope.convertJsDateToString($scope.filter.fromdate);
      if ($scope.filter.merchantcode == 0) {
        alert("please choose the Merchant");
        return;
      }
      var data = {
        datefrom: from,
        merchantcode: $scope.filter.merchantcode,
      };
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetMerchantTransactionPerHour.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          console.log(data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response);
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      $scope.getListMerchantWithAccount();
    };
    $scope.init();
  },
]);

app.controller("accountReportDailyRealtimeCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$uibModal",
  "$interval",
  function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval) {

    $scope.gridIsLoading = false;
    $scope.merchantList = [];

    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    // Inisialisasi grid
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "account-report-daily-realtime.xlsx",
      exporterExcelSheetName: "Sheet1",
      columnDefs: [],
      data: [],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
    };

    // 🔹 Ambil daftar merchant
    $scope.getMerchantList = function (callback) {
      $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getListNoDemo.php",
        data: { data: "" },
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      }).then(function (response) {
        var data = CRYPTO.decrypt(response.data.data);
        if (data.status.toLowerCase() == "ok") {
          $scope.merchantList = data.records.map((x) => x.merchantcode);
          console.log("Merchant list:", $scope.merchantList);
          if (callback) callback();
        } else {
          alert(data.message);
        }
      });
    };

    // 🔹 Buat kolom dinamis berdasarkan merchant
    $scope.buildColumnDefs = function () {
      let cols = [
        { name: "Date", field: "date", width: 100 },
        { name: "Bank", field: "bankCode", width: 100 },
        { name: "Account No", field: "accNo", width: 120 },
        { name: "Account Name", field: "accName", width: 200 },
        {
          name: "Last Balance",
          field: "lastbalance",
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0}}</div>',
          width: 130,
        },
      ];

      // tambahkan kolom merchant horizontal
      $scope.merchantList.forEach((m) => {
        cols.push({
          name: m,
          field: m,
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          width: 100,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0}}</div>',
        });
      });
      // tambahkan total kolom (tidak dipecah per merchant)
      cols.push(
        {
          name: "Total Deposit",
          field: "totalDeposit",
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0}}</div>',
          width: 130,
        },
        {
          name: "Total Withdraw",
          field: "totalWithdraw",
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0}}</div>',
          width: 130,
        },
        {
          name: "Total Pending",
          field: "totalPending",
          cellFilter: "number: 0",
          cellClass: "grid-alignright",
          width: 120,
        }
      );

      $scope.gridOptions.columnDefs = cols;
    };

    // 🔹 Ambil data laporan
    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getAccountReportDailyRealtime.php",
        data: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data.data || response.data;
          let records = data.records || [];

          // Bentuk data per akun, mapping merchant deposit
          let result = [];
          records.forEach((r) => {
            let row = {
              date: r.date,
              bankCode: r.bankCode,
              accNo: r.accNo,
              accName: r.accName,
              totalDeposit: r.totalDeposit || 0,
              totalWithdraw: r.totalWithdraw || 0,
              totalPending: r.totalPending || 0,
              lastbalance: r.lastbalance || 0,
            };

            // isi deposit per merchant
            $scope.merchantList.forEach((m) => {
              row[m] = r.merchantDeposit && r.merchantDeposit[m]
                ? r.merchantDeposit[m]
                : 0;
            });

            result.push(row);
          });

          $scope.gridOptions.data = result;
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.error(response.status);
        }
      );
    };

    // 🔹 Refresh
    $scope.refresh = function () {
      $scope.getListData();
    };

    // 🔹 Inisialisasi
    $scope.init = function () {
      $scope.getMerchantList(function () {
        $scope.buildColumnDefs();
        $scope.getListData();
      });
    };

    $scope.init();
  },
]);

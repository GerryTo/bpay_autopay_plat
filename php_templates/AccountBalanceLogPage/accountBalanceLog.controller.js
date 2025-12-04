app.controller("accountBalanceLogCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$stateParams",
  "$uibModal",
  "$interval",
  "$rootScope",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal,
    $interval,
    $rootScope
  ) {
    $scope.gridIsLoading = false;

    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.filter = {
      date: new Date(),
      type: "1",
    };

    $scope.popup1 = {
      opened: false,
    };

    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      rowTemplate:
        "<div ng-style=\"{'background-color': row.entity.n_missmatch === '1' ? 'red' : ''}\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
      columnDefs: [
        {
          name: "Date Insert",
          field: "d_insert",
          aggregationType: uiGridConstants.aggregationTypes.count,
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
          width: 150,
        },
        { name: "Date Timestamp", field: "d_timestamp", width: 150 },
        {
          name: "User",
          field: "v_user",
          width: 150,
          //     cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.n_missmatch === '1' ? 'red' : ''}">
          //     {{row.entity.v_user}}
          //  </div>`,
        },
        { name: "Bank Acc No", field: "v_bankaccountno", width: 100 },
        { name: "Bank Code", field: "v_bankcode", width: 100 },
        {
          name: "Starting Balance",
          field: "n_startingBalance",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
          cellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right" >' +
            // "<span ng-if=\"row.entity.n_missmatch === '1'\">MISS MATCH</span>" +
            "<span >{{COL_FIELD | number:" +
            decimalDigit +
            "}}</span>" +
            "</div>",
        },
        {
            name: "Main Page",
            field: "n_nowBalance",
            cellClass: "grid-alignright",
            cellFilter: "number: " + decimalDigit,
            type: "number",
            width: 100,
        },
        {
          name: "Current Balance",
          field: "n_currentBalance",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash Out",
          field: "n_cashOut",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash Out Comm",
          field: "n_coCommission",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash Out Transaction",
          field: "n_coTransactions",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash In",
          field: "n_cashIn",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash In Comm",
          field: "n_ciCommission",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Cash In Transaction",
          field: "n_ciTransactions",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Receive",
          field: "n_b2bReceive",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Receive Transaction",
          field: "n_brTransactions",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Receive Bank Count",
          field: "n_b2bReceiveBankCount",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Receive Bank Transaction",
          field: "n_b2bReceiveBankTransaction",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Send",
          field: "n_b2bSend",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Send Transaction",
          field: "n_bsTransactions",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Send Bank Count",
          field: "n_b2bSendBankCount",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "B2B Send Bank Transaction",
          field: "n_b2bSendBankTransaction",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Agent Cashout",
          field: "n_agentCashout",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Agent Cashout Comm",
          field: "n_agentCashoutComm",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
        {
          name: "Agent Cashout Transaction",
          field: "n_agentCashoutTrans",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
          width: 100,
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.monthly = function () {
      $state.go("account-balance-log-monthly");
    };

    $scope.getListData = function () {
      var date = $scope.convertJsDateToString($scope.filter.date);
      var type = $scope.filter.type;
      var data = { date: date, type: type };
      console.log(data);
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getAccountBalanceLog.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;

          if (data.status.toLowerCase() == "ok") {
            // Buat nilai kosong untuk baris dengan n_missmatch = 1
            // for (var i = 0; i < data.records.length; i++) {
            //   if (data.records[i].n_missmatch === "1") {
            //     // Simpan nilai v_user, n_missmatch, dan nilai lain yang perlu dipertahankan
            //     var v_user = data.records[i].v_user;
            //     var n_missmatch = data.records[i].n_missmatch;
            //     var d_insert = data.records[i].d_insert;
            //     var d_timestamp = data.records[i].d_timestamp;
            //     var v_bankaccountno = data.records[i].v_bankaccountno;
            //     var v_bankcode = data.records[i].v_bankcode;

            //     // Kosongkan semua nilai numerik
            //     data.records[i] = {
            //       v_user: v_user,
            //       n_missmatch: n_missmatch,
            //       d_insert: d_insert,
            //       d_timestamp: d_timestamp,
            //       v_bankaccountno: v_bankaccountno,
            //       v_bankcode: v_bankcode,
            //       n_startingBalance: null,
            //       n_currentBalance: null,
            //       n_cashOut: null,
            //       n_coCommission: null,
            //       n_coTransactions: null,
            //       n_cashIn: null,
            //       n_ciCommission: null,
            //       n_ciTransactions: null,
            //       n_b2bReceive: null,
            //       n_brTransactions: null,
            //       n_b2bSend: null,
            //       n_bsTransactions: null,
            //       n_agentCashout: null,
            //       n_agentCashoutComm: null,
            //       n_agentCashoutTrans: null,
            //     };
            //   }
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

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

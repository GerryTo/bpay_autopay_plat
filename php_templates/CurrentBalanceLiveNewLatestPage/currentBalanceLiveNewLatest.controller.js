app.controller("currentBalanceLiveNewLatestCtrl", [
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
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };
    var today = new Date();
    var yesterday = new Date(today);
    // yesterday.setDate(today.getDate() - 1);

    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: yesterday,
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
      fromdate: yesterday,
      todate: yesterday,
      accountno: "0",
    };

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Date", field: "date", width: 150 },
        {
          name: "Agent Username",
          field: "agentUsername",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.count, // Menghitung total agent
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue()}}</div>',
        },
        {
          name: "NAGAD Credit",
          field: "finalNagadCredit",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "BKASH Credit",
          field: "finalBkashCredit",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Cash Out Amount",
          field: "totalCashOut",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Cash In Amount",
          field: "totalCashIn",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Nagad Cash Out Amount",
          field: "totalCashOutNagad",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Nagad Cash In Amount",
          field: "totalCashInNagad",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Bkash Cash Out Amount",
          field: "totalCashOutBkash",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Bkash Cash In Amount",
          field: "totalCashInBkash",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Credit Adjusment In",
          field: "finalAdjustmentIn",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Credit Adjustment Out",
          field: "finalAdjustmentOut",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Credit Topup",
          field: "finalTopUp",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 150,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Action",
          field: "id",
          width: 300,
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'in\')"  >Adjust In</button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'out\')"  >Adjust Out</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.adjust = function (dataParam, type) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/AgentCreditAdjustmentModal/AgentCreditAdjustmentModal.template.html?v=" +
          new Date().getTime(),
        controller: "agentCreditAdjustmentModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          params: function () {
            return {
              name: dataParam.agentUsername,
              user: dataParam.agentUsername,
              credit: 0,
              nagad: dataParam.finalNagadCredit,
              bkash: dataParam.finalBkashCredit,
              type: type,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var data = {
            username: dataParam.agentUsername,
            adjustType: type,
            amount: returnValue.amount,
            bankAccountNo: returnValue.bankAccountNo,
            bankCode: returnValue.bankCode,
            note: returnValue.note,
            source: returnValue.source,
            purpose: returnValue.purpose,
          };
          // console.log(data);
          // return;
          // var jsonData = CRYPTO.encrypt(data);
          $http({
            method: "POST",
            url: webservicesUrl + "/agent/cp_credit_adjustment.php",
            data: data,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              // var data = CRYPTO.decrypt(response.data.data);
              var data = response.data;
              if (data.status.toLowerCase() == "success") {
                alert("Credit Adjustment Success!");
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

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getTransactionByAgentLive_new.php",
        data: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(response.data.data);
          var data = response.data;

          if (data.status.toLowerCase() == "success") {
            $scope.gridOptions.data = data.records;
            // console.log(data.records);
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

    $scope.getHeight = function () {
      return window.innerHeight - 280;
    };

    $scope.init = function () {
      // $scope.getListAccount();
      $scope.getListData();
    };
    $scope.init();
  },
]);

app.controller("monthlySummaryCtrl", [
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

    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: previousMonth,
      minMode : "month",
      //minDate: new Date(),
      startingDay: 1,
    };
    $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };
    // $scope.popup2 = {
    //   opened: false,
    // };
    // $scope.open2 = function () {
    //   $scope.popup2.opened = true;
    // };

    $scope.filter = {
      date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
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
      exporterExcelFilename: "agent-summary.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Agent",
          field: "agent",
          width: 200,
          aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Bank",
          field: "bankCode",
          width: 200,
        },
        {
          name: "Account No",
          field: "accountNo",
          width: 200,
          // aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Starting Balance",
          field: "startingBalance",
          width: 200,
          cellFilter: "number:2"
          // aggregationType: uiGridConstants.aggregationTypes.count,
        },
        {
          name: "Current Balance",
          field: "currentBalance",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Cash Out",
          field: "cashOut",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Cash Out Comm.",
          field: "cashOutCommission",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Cash Out Transaction",
          field: "cashOutTransaction",
          width: 200,
          cellFilter: "number:0"
        },
        {
          name: "Cash In",
          field: "cashIn",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Cash In Comm.",
          field: "cashInCommission",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Cash In Transaction",
          field: "cashInTransaction",
          width: 200,
          cellFilter: "number:0"
        },
        {
          name: "B2B Receive",
          field: "b2bReceive",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "B2B Receive Transaction",
          field: "b2bReceiveTransaction",
          width: 200,
          cellFilter: "number:0"
        },
        {
          name: "B2B Send",
          field: "b2bSend",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "B2B Send Transaction",
          field: "b2bSendTransaction",
          width: 200,
          cellFilter: "number:0"
        },
        {
          name: "Agent Cash Out",
          field: "agentCashout",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Agent Cash Out Comm.",
          field: "agentCashoutCommission",
          width: 200,
          cellFilter: "number:2"
        },
        {
          name: "Agent Cash Out Transaction",
          field: "agentCashoutTransaction",
          width: 200,
          cellFilter: "number:0"
        },
        {
          name: "Commission",
          field: "commission",
          width: 200,
          cellFilter: "number:2"
        },
        // {
        //   name: "Crawl Summary Monthly",
        //   field: "monthlyExists",
        //   width: 200,
        // },
        // {
        //   name: "Transaction Match",
        //   field: "totalResubmitMatch",
        //   width: 200,
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        // },
        // {
        //   name: "Is Recrawling",
        //   field: "isCheckDeposit",
        //   width: 100,
        //   aggregationType: uiGridConstants.aggregationTypes.sum,
        //   cellTemplate: `<div class="ui-grid-cell-contents">{{ COL_FIELD == 1 ? 'Y' : 'N' }}</div>`,
        // },
        // {
        //   name: "Action",
        //   field: "merchantcode",
        //   cellTemplate:
        //     '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.recrawl(row.entity)">Recrawl</button>',
        //     // '<button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.checkDeposit(row.entity,0)">Stop</button>',
        //   width: 260,
        // },
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

      var date =
        $scope.convertJsDateToString($scope.filter.date);
      // var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { date: date, };
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/monthlySummary_list.php",
        data: { data: data },
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

app.controller("SummaryBkashmCtrl", [
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
    $scope.dataCount = 0;
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
        {
          name: "Deposit Amount",
          field: "depositAmount",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Deposit Count",
          field: "depositCount",
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
        datefrom: fromdate,
        dateto: todate,
      };

      $http({
        method: "POST",
        url: webservicesUrl + "/getSummaryBkashm.php",
        data: { data: data },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          console.log(data);
          if (data.status.toLowerCase() == "ok") {
            $scope.gridOptions.data = data.records;
            $scope.dataCount = data.records[0].totalBank;
            console.log(data.records[0].totalBank);
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
  },
]);

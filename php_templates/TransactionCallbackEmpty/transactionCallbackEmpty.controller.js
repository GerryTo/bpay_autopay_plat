app.controller("transactionCallbackEmptyCtrl", [
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
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
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
    $scope.filter = {
      data: [],
      fromdate: new Date(),
      todate: new Date(),
      type: "2",
      user: "",
    };
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "transaction-empty-callback.xlsx",
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
          // width: 100,
        },
        { name: "Date", field: "insert", width: 150 },
        { name: "Complete Date", field: "completedate", width: 150 },
        { name: "Merchant Code", field: "merchantcode", width: 100 },
        { name: "Customer Code", field: "customercode", width: 180 },
        { name: "Trans Type", field: "transactiontype", width: 100 },
        { name: "CCY", field: "ccy", visible: false },
        { name: "Status", field: "status", width: 120 },
        { name: "Trans ID", field: "transactionid", width: 100 },
        { name: "Notes 3", field: "notes3", width: 150 },
        {
          name: "Callback Status",
          field: "merchantcallbackresponse",
          width: 150,
          cellTooltip: function (row, col) {
            return row.entity.merchantcallbackresponse;
          },
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.event = {
      refresh: () => {
        $scope.getListData();
      },
      resend: () => {
        var data = $scope.filter.data;
        if (!data.length) {
          // emtpy data
          return alert("Empty data");
        }
        var confirm = window.confirm("Are you sure want resend callback?");
        if (confirm) {
          $scope.sendCallback(data);
        } else {
          console.log("Cencel");
        }
      },
    };

    $scope.getListData = () => {
      $scope.gridIsLoading = true;
      data = { date: $scope.convertJsDateToString($scope.filter.fromdate) };
      $http({
        method: "POST",
        url: `${webservicesUrl}/transactionCallbackEmpty_getList.php`,
        data: {
          data: CRYPTO.encrypt(data),
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        (success = (res) => {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(res.data.data);
          var data = res.data;
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            for (let i = 0; i < data.records.length; i++) {
              $scope.filter.data[i] = { id: data.records[i].futuretrxid };
            }
            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        }),
        (error = (err) => {
          console.log(err);
          $scope.gridIsLoading = false;
        })
      );
    };

    $scope.sendCallback = (data) => {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: `${webservicesUrl}/transactionCallbackEmpty_resendCallback.php`,
        data: {
          // data: CRYPTO.encrypt(data)
          data: data,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        (success = (res) => {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(res.data.data);
          var data = res.data;
          alert(data.message);
          $scope.getListData();
        }),
        (error = (err) => {
          console.log(err);
          alert("Resend Callback Failed");
          $scope.gridIsLoading = false;
        })
      );
    };

    $scope.init = function () {
      //
    };
    $scope.init();
  },
]);

app.controller("findTrxidBytrxidCtrl", [
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
      transId: "",
      history: false,
      similarSearch: false,
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
          name: "Trx Id",
          field: "v_notes3"
        },
        {
          name: "Action",
          field: "futuretrxid",
          width: 200,
          cellTemplate:
            ' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.change(row.entity)">Chage</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.change = function (dataParam) {
      console.log(dataParam);
      var data = {
        trxid: dataParam.v_notes3,
      };
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/updateTrxidArchive.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          console.log(response.data);
          var data = response.data;
          if (data.status == "ok") {
            alert("change trx id success");
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.status);
        }
      );
    }

    $scope.getListData = function () {
      if ($scope.filter.transId == "") {
        alert("Please Input Trx Id");
        return false;
      }

      var data = {
        transId: $scope.filter.transId,
      };
      var jsonData = data;

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetTrxidArchive.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          console.log(response.data);
          var data = response.data;
          if (data.status == "ok") {
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

    };
    $scope.init();
  },
]);

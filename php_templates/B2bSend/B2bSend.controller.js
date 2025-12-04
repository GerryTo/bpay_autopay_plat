app.controller("B2bSend", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  function ($state, $scope, $http, $timeout, uiGridConstants) {
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
      accountno: "0",
    };

    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };
    $scope.gridOptions = {
      enableSorting: true,
      enableFiltering: true,
      showColumnFooter: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Date",
          field: "date",
          aggregationType: uiGridConstants.aggregationTypes.count,
        },
        { name: "User", field: "user" },
        { name: "Account No", field: "account" },
        { name: "Bank", field: "bank" },
        { name: "Amount", field: "amount" },
        { name: "Status", field: "status" },
      ],
      data: [],
    };
    $scope.typeLogin = "";

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = {
        datefrom: from,
        dateto: to,
        accountno: $scope.filter.accountno,
      };

      $http({
        method: "POST",
        url: webservicesUrl + "/getAgent.php",
        data: { data: data },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          if (data.status.toLowerCase() == "ok") {
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

    $scope.new = function () {
      $state.go("send-manual-b2b", { data: {} });
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

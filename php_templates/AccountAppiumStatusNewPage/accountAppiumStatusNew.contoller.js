app.controller("accountAppiumStatusNewCtrl", [
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
      type: "2",
      user: "",
    };
    $scope.phoneUsers = [];
    //------------------

    //$scope.products = [];
    var index = 0;

    $scope.gridIsLoading = false;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "status-crawler-account.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "User", field: "mainUser", width: 150, aggregationType: uiGridConstants.aggregationTypes.count },
        { name: "Bank", field: "bankCode", width: 100 },
        // { name: "OTP Setter", field: "userOtpSetter", width: 150 },
        { name: "Status OTP", field: "statusDesOtpSender", width: 150 },
        // { name: "HeartBeat", field: "heartbeatOtpSender", width: 280 },
        // { name: "Comm Getter", field: "userCommGetter", width: 120 },
        {
          name: "Status Comm Getter",
          field: "statusDesCommGetter",
          width: 200,
        },
        // { name: "HeartBeat", field: "heartbeatCommGetter", width: 280 },
        // { name: "Note Comm getter", field: "noteCommGetter", width: 120 },
        // { name: "Automation", field: "userAppiumServer", width: 150 },
        {
          name: "Status Automation",
          field: "statusAppiumServer",
          width: 200,
        },
        // {
        //   name: "State Automation",
        //   field: "statusDesAppiumServer",
        //   width: 200,
        // },
        // { name: "HeartBeat", field: "heartbeatAppiumServer", width: 280 },
        { name: "Note Automation", field: "noteAppiumServer", width: 150 },
        { name: "Server Name", field: "serverName", width: 150 },
        { name: "Serial No.", field: "serialNumber", width: 150 },
        // {
        //   name: "Action",
        //   field: "mainUser",
        //   cellTemplate:
        //     ' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.checkHeartbeat(row.entity)"> Heartbeat </button>',
        //   width: 260,
        // },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      let data = {};
      var jsonData = data;

      $http({
        method: "POST",
        url: webservicesUrl + "/accountAppiumStatusNew_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          console.log(response.data);

          var response_data = response.data.data;
          var data = response_data;
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

    $scope.checkHeartbeat = function (params) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/HeartbeatStatusModal/heartbeatStatusModal.template.html?v=" +
          new Date().getTime(),
        controller: "HeartbeatStatusModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return { userid: params.mainUser, bankcode: params.bankCode };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {},
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.changeReady = function (params) {
      $scope.gridIsLoading = true;
      let data = {
        username: params.userAppiumServer,
      };
      var jsonData = data;
      $http({
        method: "POST",
        url: webservicesUrl + "/appiumAccountChangeStatusReady.php",
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
            alert(data.messages);
            $scope.getListData();
          } else {
            alert(data.messages);
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

app.controller('servicePythonListNACtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal',
  '$interval', '$rootScope',
  function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal, $interval, $rootScope) {

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      rowTemplate: 'templates/rowTemplate.html',
      columnDefs: [
        { name: 'User', field: 'v_mainuser'},
        { name: 'Email', field: 'v_email'},
        { name: 'Password', field: 'v_password_bkash'},
        // { name: 'Service Name', field: 'v_servicename' },
        // { name: 'Description', field: 'v_description' },
        // {
        //   name: "Action",
        //   field: "n_id",
        //   width: 250,
        //   cellTemplate:
        //     '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 1)"> RESTART </button>' +
        //     '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 2)"> START </button>' +
        //     '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 3)"> STOP </button>',
        // },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.ExecuteService = function (data, status) {
      console.log(data);
      console.log(status);
      var stmt = '';
      if (status == 1) {
        stmt = 'restart';
      } else if (status == 2) {
        stmt = 'start';
      }
      else if (status == 3) {
        stmt = 'stop';
      }
      console.log(stmt);
      console.log(data.v_mainuser);
      var data1 = {
        statment: stmt,
        servicename: data.v_mainuser,
      };

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/executeServicePython.php",
        data: { data: data1 },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
        $scope.gridIsLoading = false;
        var data = response.data;
        console.log(response.data.status);
        if (data.status.toLowerCase() == 'success') {
          alert(data.message);
          $scope.getListData();
        } else {
          alert(data.message);
        }
      }, function myError(response) {
        $scope.gridIsLoading = false;
        console.log(response.data.status);
      });
    }

    $scope.getListData = function () {
      var data = {};

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetServiceList.php",
        data: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
        $scope.gridIsLoading = false;
        var data = response.data;

        console.log(data.records);

        if (data.status.toLowerCase() == 'success') {
          $scope.gridOptions.data = data.records;
        } else {
          alert(data.message);
        }
      }, function myError(response) {
        $scope.gridIsLoading = false;
        console.log(response.status);
      });
    }


    $scope.refresh = function () {
      $scope.getListData();
    }

    $scope.init = function () {
      $scope.getListData();
    }
    $scope.init();
  }]);


app.controller('ResendCallbackServiceCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal',
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
        { name: 'Id', field: 'n_id', width: 100, aggregationType: uiGridConstants.aggregationTypes.count, },
        { name: 'Status', field: 'v_status', width: 300 },
        { name: 'Date', field: 'd_insert' },
        {
          name: "Action",
          field: "n_id",
          width: 250,
          cellTemplate:
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity)"> RERUN </button>'
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.ExecuteService = function (item) {
      if (!item || !item.n_id) {
        alert("Invalid data row!");
        return;
      }
      if (!confirm("Are you sure you want to rerun this callback?")) {
        return;
      }
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/executeResendCallbackServicePython.php",
        data: $.param({ id: item.n_id }), // kirim id baris
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          console.log("Response:", data);

          if (data.status && data.status.toLowerCase() === "success") {
            alert(data.message || "Resend callback executed successfully!");
            $scope.getListData();
          } else {
            alert(data.message || "Failed to execute resend callback.");
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log("Error:", response);
          alert("Connection error while executing callback.");
        }
      );
    };


    $scope.getListData = function () {
      var data = {};

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetResendCallbackServiceList.php",
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

    $scope.AddResendCallback = function () {
      if (confirm("Are you sure you want resend callback ?")) {
        $scope.gridIsLoading = true;

        $http({
          method: "POST",
          url: webservicesUrl + "/addResendCallback.php",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            if (response.data.status.toLowerCase() === "ok") {
              alert("Add Resend Callback Success!");
              $scope.getListData();
            } else {
              alert(response.data.message);
            }
            $scope.gridIsLoading = false;
          },
          function myError(response) {
            console.log(response);
            $scope.gridIsLoading = false;
          }
        );
      } else {
        // user tekan "Cancel"
        console.log("User canceled resend callback.");
      }
    };


    $scope.refresh = function () {
      $scope.getListData();
    }

    $scope.init = function () {
      $scope.getListData();
    }
    $scope.init();
  }]);


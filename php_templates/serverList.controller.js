app.controller("serverListCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$uibModal",
  "$window",
  function ($state, $scope, $http, $timeout, $uibModal, $window) {
    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      showGridFooter: true,
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      exporterExcelFilename: "AutomationCreate.xlsx",
      exporterPdfMaxGridWidth: 500,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Server Name", field: "name" },
        { name: "Anydesk Address", field: "address" },
        { name: "Password", field: "password" },
        {
          name: "Action",
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm" ng-click="grid.appScope.delete(row.entity)">Delete</button>',
        },
      ],
      data: [],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi; // Register the grid API
      },
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/serverList_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function (response) {
          $scope.gridIsLoading = false;
          const data = response.data;
          if (data.status.toLowerCase() === "ok") {
            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        },
        function (response) {
          $scope.gridIsLoading = false;
          console.error(response.status);
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.new = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/ServerListModal/serverListModal.template.html?v=2",
        controller: "serverListModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {},
      });

      modalInstance.result.then(function (returnResult) {
        $scope.gridIsLoading = true;
        const params = {
          name: returnResult.name,
          address: returnResult.address,
          password: returnResult.password,
        };
        $http({
          method: "POST",
          url: webservicesUrl + "/serverList_create.php",
          data: { data: params },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function (response) {
            $scope.gridIsLoading = false;
            const data = response.data;
            if (data.message === "success add server") {
              alert("Server added successfully");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function (response) {
            $scope.gridIsLoading = false;
            console.error(response);
          }
        );
      });
    };

    $scope.edit = function (selectedRow) {
      

      $stateParams = {
        name: selectedRow.name || "",
        address: selectedRow.address || "",
        password: selectedRow.password || "",
      };
      // console.log($stateParams)

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/ServerListModal/serverListModal.template.html?v=2",
        controller: "serverListModalCtrl",
        size: "md",
        resolve: {
          $stateParams: function () {
            return $stateParams; 
          },
        }
      });

      modalInstance.result.then(function (updatedData) {
        $http({
          method: "POST",
          url: webservicesUrl + "/serverList_update.php",
          data: { data: updatedData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function (response) {
            const data = response.data;
            if (data.message === "success update server") {
              alert("Server updated successfully");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function (response) {
            console.error(response);
          }
        );
      });
    };
    $scope.delete = function (selectedRow) {
      if ($window.confirm(`Are you sure you want to delete the server: ${selectedRow.name}?`)) {
      $stateParams = {
        name: selectedRow.name || "",
      }};
      // console.log($stateParams)

        $http({
          method: "POST",
          url: webservicesUrl + "/serverList_delete.php",
          data: { data: $stateParams },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function (response) {
            const data = response.data;
            if (data.message === "success delete server") {
              alert("Server deleted successfully");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function (response) {
            console.error(response);
          }
        );
    };

    $scope.init = function () {
      $scope.getListData();
    };

    $scope.init();
  },
]);

app.controller("serviceCenterWhitelistCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$uibModal",
  "uiGridConstants",
  function ($state, $scope, $http, $timeout, $uibModal, uiGridConstants) {
    //$scope.products = [];
    $scope.gridIsLoading = false;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Service Center", field: "serviceCenter", width: 220 },
        { name: "Description", field: "description" },
        { name: "Amount", field: "maxAmountAllowed" },
        { name: "Active", field: "isActive", width: 100 },
        {
          name: "Action",
          field: "phoneNumber",
          width: 100,
          enableFiltering: false,
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' +
            $scope.globallang.edit +
            "</button>",
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/serviceCenterWhitelist_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          data.records = $scope.urlDecode(data.records);

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

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.addnew = function () {
      $state.go("servicecenter-whitelist-form", {
        data: {
          id: null,
          serviceCenter: "",
          description: "",
          isActive: "Y",
          maxAmountAllowed: 0,
        },
      });
    };
    $scope.edit = function (data) {
      $state.go("servicecenter-whitelist-form", {
        data: {
          id: data.id,
          serviceCenter: data.serviceCenter,
          description: data.description,
          isActive: data.isActive,
          maxAmountAllowed: data.maxAmountAllowed,
        },
      });
    };

    /*$scope.delete = function (data) {
        if (confirm('Are you sure want to delete [' + data.bankAccNo + ']?')) {
            var data = { bankAccNo: data.bankAccNo, bankCode: data.bankCode };
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/deleteMasterMyBank.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }*/

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

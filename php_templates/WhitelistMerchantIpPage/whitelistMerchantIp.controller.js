app.controller("whitelistMerchantIpCtrl", [
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
        { name: "Merchant", field: "merchantCode", width: 220 },
        { name: "Server IP", field: "ip" },
        {
          name: "Action",
          field: "phoneNumber",
          width: 200,
          enableFiltering: false,
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' +
            $scope.globallang.edit +
            "</button>" +
            '<button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.delete(row.entity)">' +
            $scope.globallang.delete +
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
        url: webservicesUrl + "/whitelistMerchantIp_getList.php",
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
      $state.go("whitelist-merchant-ip-form", {
        data: { id: null, merchantCode: "", ip: "" },
      });
    };
    $scope.edit = function (data) {
      $state.go("whitelist-merchant-ip-form", {
        data: {
          id: data.id,
          merchantCode: data.merchantCode,
          ip: data.ip,
        },
      });
    };

    $scope.delete = function (data) {
      if (
        confirm(
          "Are you sure want to delete [" +
            data.merchantCode +
            " - " +
            data.ip +
            "]?"
        )
      ) {
        var data = { id: data.id };
        var jsonData = CRYPTO.encrypt(data);

        $http({
          method: "POST",
          url: webservicesUrl + "/whitelistMerchantIp_delete.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            console.log(response);
          }
        );
      }
    };

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

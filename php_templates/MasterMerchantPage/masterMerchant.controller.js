app.controller("masterMerchantCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  function ($state, $scope, $http, $timeout) {
    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.gridOptions = {
      enableSorting: true,
      columnDefs: [
        { name: "Merchant Code", field: "merchantcode" },
        { name: "Merchant Name", field: "merchantname" },
        { name: "Timezone", field: "timezone" },
        // { name: 'Current Balance', field: 'newbalance',cellFilter: 'number: 2', cellClass: 'grid-alignright', type:'number' },
        {
          name: "Action",
          field: "merchantcode",
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' +
            $scope.globallang.edit +
            '</button>   <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.delete(row.entity)">' +
            $scope.globallang.delete +
            "</button>",
        },
      ],
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
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
      $state.go("master-merchant-form-superadmin", {
        data: { merchantcode: "" },
      });
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.edit = function (data) {
      $state.go("master-merchant-form-superadmin", {
        data: { merchantcode: data.merchantcode },
      });
    };

    $scope.adjustment = function (data) {
      $state.go("masterMerchantAdjustmentBalanceFormPage", {
        data: { merchantcode: data.merchantcode },
      });
    };

    $scope.delete = function (data) {
      if (confirm("Are you sure want to delete [" + data.merchantname + "]?")) {
        var data = { merchantcode: data.merchantcode };
        var jsonData = CRYPTO.encrypt(data);

        $http({
          method: "POST",
          url: webservicesUrl + "/deleteMasterMerchant.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              $scope.getProducts();
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

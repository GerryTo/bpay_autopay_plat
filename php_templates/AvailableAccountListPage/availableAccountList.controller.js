app.controller("availableAccountListCtrl", [
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
    //$scope.products = [];
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
      columnDefs: [
        { name: "Agent", field: "v_user" },
        { name: "Merchant", field: "v_merchantcode" },
        { name: "Bank", field: "v_bankcode" },
        { name: "Bank Account", field: "v_bankaccountno" },
        { name: "User", field: "v_user", width: 100 },
        { name: "Group ID", field: "n_groupid" },
        { name: "Use", field: "n_isUsed" },
        { name: "active", field: "v_isactive" },
        { name: "Type", field: "v_type" },
        { name: "Date", field: "d_date" },
        { name: "Counter", field: "n_current_counter" },
        {
          name: "Action",
          field: "v_user",
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' +
            $scope.globallang.edit +
            "</button>",
        },
      ],
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/AvailableAccountList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
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

    $scope.edit = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/EditAvailableAccountModal/EditAvailableAccountModal.template.html",
        controller: "editAvailableAccountCtrl",
        scope: $scope,
        resolve: {
          params: function () {
            return { isUsed: data.n_isUsed };
          },
        },
      });
      modalInstance.result.then(
        function (returnValue) {
          console.log(returnValue);
          var params = {
            ...data,
            isUsed: returnValue.isUsed,
          };
          var jsonData = CRYPTO.encrypt(params);
          $http({
            method: "POST",
            url: webservicesUrl + "/UpdateAvailableAccountUse.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              //   console.log(response);
              //   var data = CRYPTO.decrypt(response.data.data);
              if (response.data.status.toLowerCase() == "ok") {
                alert("Change status use success!");
                $scope.getListData();
              } else {
                alert(response.data.data.message);
              }
            },
            function myError(response) {
              console.log(response);
            }
          );
        },
        function () {
          //console.log('Modal dismissed at: ' + new Date());
        }
      );
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

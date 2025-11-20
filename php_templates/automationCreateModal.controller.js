app.controller("automationCreateModalCtrl", [
  "$state",
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "$http",
  "$timeout",
  function ($state, $scope, $uibModalInstance, $uibModal, $http, $timeout) {
    $scope.mainUser = "";
    $scope.system = "AUTOMATION";
    $scope.username = "";
    $scope.bankCode = "NAGAD";
    $scope.searchText = "";
    $scope.loginAccount = [];
    $scope.itemShow = "";
    $scope.useappium = "0";
    $scope.phonenumber = "";
    $scope.provider = "";

    $scope.pick = function (item) {
      $scope.searchText = item.user;
      $scope.mainUser = item.user;
      $scope.isShow = false;
      $scope.phonenumber= item.phonenumber;
    };

    $scope.getListLoginUser = function () {
      $http({
        method: "post",
        url: webservicesUrl + "/loginAccount_getList.php",
        data: {},
        Headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = response.data;
          if (data.status === "ok") {
            $scope.loginAccount = data.records; 
          }
        },

        function myError(response) {
          console.log(response);
        }
      );
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };

    $scope.save = function () {
      if ($scope.username == "" || $scope.username == undefined) {
        alert("please insert the username");
        return false;
      }

      if ($scope.system == "" || $scope.system == undefined) {
        alert("please choose system");
        return false;
      }
      if ($scope.bankCode == "" || $scope.bankCode == undefined) {
        alert("please choose bankCode");
        return false;
      }
      if ($scope.mainUser == "" || $scope.mainUser == undefined) {
        alert("please choose mainUser");
        return false;
      }
      if ($scope.useappium == "" || $scope.useappium == undefined) {
        alert("please choose useAppium");
        return false;
      }

      var tmp = {
        mainUser: $scope.mainUser,
        username: $scope.username,
        bankCode: $scope.bankCode,
        system: $scope.system,
        useappium: $scope.useappium,
        phonenumber: $scope.phonenumber,
        provider: $scope.provider,
      };
      console.log(tmp);
      $uibModalInstance.close(tmp);
    };
    $scope.init = function () {
      $scope.getListLoginUser();
    };
    $scope.init();
  },
]);

app.controller("whitelistMerchantIpFormCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$stateParams",
  function ($state, $scope, $http, $timeout, $stateParams) {
    $scope.data = {
      id: null,
      merchantCode: "",
      ip: "",
    };
    $scope.edit = { mode: false };
    $scope.merchantList = [];

    $scope.getMerchant = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.merchantList = data.records;
            if (data.records.length > 0 && $scope.data.merchantCode == "") {
              $scope.data.merchantCode = data.records[0].merchantcode;
            }
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.loadData = function () {
      if ($scope.data.id == null || $scope.data.id == 0) return false;
      var data = { id: $stateParams.data.id };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/whitelistMerchantIpForm_getData.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            if (data.records.length > 0) {
              $scope.data = $scope.urlDecode(data.records[0]);
            }
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.save = function () {
      if ($scope.data.merchantCode == "") {
        alert("Please select Merchant");
        return false;
      }

      if ($scope.data.ip == "") {
        alert("Please input IP that want to be whitelisted");
        return false;
      }

      var tmp = $scope.data;
      var jsonData = CRYPTO.encrypt(tmp);

      $http({
        method: "POST",
        url: webservicesUrl + "/whitelistMerchantIpForm_saveData.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Data Saved");
            $state.go("whitelist-merchant-ip");
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.cancel = function () {
      $state.go("whitelist-merchant-ip");
    };

    $scope.init = function () {
      if ($stateParams.data != null) {
        $scope.data.id = $stateParams.data.id;
        $scope.data.merchantCode = $stateParams.data.merchantCode;
        $scope.data.ip = $stateParams.data.ip;
      } else {
        $state.go("whitelist-merchant-ip");
      }

      $scope.getMerchant();
      $scope.loadData();
      if ($stateParams.data.id != null) {
        $scope.edit.mode = true;
      }
    };
    $scope.init();
  },
]);

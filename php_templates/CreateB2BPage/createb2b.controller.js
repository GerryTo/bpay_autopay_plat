app.controller("createb2bctrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$uibModal",
  "$stateParams",
  "uiGridConstants",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    $uibModal,
    $stateParams,
    uiGridConstants
  ) {
    $scope.data = {
      bankCode: "",
      amount: 0,
      agent: "",
    };

    $scope.bank = [];
    $scope.agentList = [];

    $scope.create = function () {
      if ($scope.data.bankCode == "") {
        alert("Please select Bank Code!");
        return;
      }

      if (Number($scope.data.amount) <= 0) {
        alert("Please input Amount!");
        return;
      }

      if ($scope.data.agent == "") {
        alert("Please select agent !");
        return;
      }

      if (confirm("Are you sure you want to create B2B transaction?")) {
        var data1 = {
          bankCode: $scope.data.bankCode,
          amount: $scope.data.amount,
          agent: $scope.data.agent,
        };
        console.log(data1);
        $http({
          method: "POST",
          url: webservicesUrl + "/createB2bTransaction.php",
          data: data1,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = response.data;
            if (data.status == "ok") {
              alert("Create B2B Transaction Success");
              window.location.reload();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            console.log(response);
          }
        );
        console.log("Save");
      } else {
        console.log("Cancel");
      }
    };

    $scope.pick = function (item) {
      if (item == "") $scope.filter.agent = "";
      else $scope.filter.agent = item.v_user;
      $scope.isShow = false;
    };

    $scope.getListAgent = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getAgentListB2b.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status == "ok") {
            // console.log(data.records);
            $scope.agentList = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.getMasterBank = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getMasterBank.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.bank = data.records;

            if ($scope.bank.length > 0 && $scope.data.bankCode == "") {
              $scope.data.bankCode = $scope.bank[0].bankCode;
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

    $scope.init = function () {
      $scope.getMasterBank();
      $scope.getListAgent();
    };
    $scope.init();
  },
]);

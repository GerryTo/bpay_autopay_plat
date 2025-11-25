app.controller("masterMyBankFormCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$stateParams",
  function ($state, $scope, $http, $timeout, $stateParams) {
    $scope.phoneNumber = [];
    $scope.pickAccount = null;
    $scope.isShow = false;
    $scope.data = {
      bankAccNo: "",
      bankAccName: "",
      bankCode: "",
      balance: 0,
      LoginphoneNumber: "",
      type: "",
      pass: "",
      dailylimit: 0,
      active: "Y",
      alias: "",
      dailywithdrawallimit: 0,
      accountId: "",
      ifsc: "",
      branch: "",
      phoneNumber: "",
      dailydepositlimit: 0,
      minDeposit: 0,
      maxDeposit: 0,
      agentCommission: 0,
      agentCommissionWithdraw: 0,
      balanceDifferent: 0,
      alwaysRoundRobin: "0",
      useAppium: "0",
      flagAppium: "0",
      opentype: "P",
      automationStatus: "0",
    };
    $scope.edit = { mode: false };
    $scope.bank = [];
    $scope.merchants = [];
    $scope.checkall = false;
    $scope.logintype = "";
    $scope.isSetMerchant = "";
    $scope.isOpentypeDisabled = function () {
      return (
        $scope.edit.mode === true &&
        $scope.data.bankAccName.toLowerCase().includes("dm")
      );
    };

    $scope.session_type = window.sessionInfo.type;
    console.log("Session Type:", $scope.session_type);
    $scope.loadData = function () {
      if ($scope.data.merchantCode == "") return false;
      var data = {
        bankAccNo: $stateParams.data.bankAccNo,
        bankCode: $stateParams.data.bankCode,
      };
      console.log(data);
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/getMasterMyBank.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = response.data;
          // console.log(data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            if (data.records.length > 0) {
              data.records[0].dailywithdrawallimit = Number(
                data.records[0].dailywithdrawallimit
              );
              data.records[0].dailylimit = Number(data.records[0].dailylimit);
              data.records[0].dailydepositlimit = Number(
                data.records[0].dailydepositlimit
              );
              data.records[0].minDeposit = Number(data.records[0].minDeposit);
              data.records[0].maxDeposit = Number(data.records[0].maxDeposit);
              data.records[0].agentCommission = Number(
                data.records[0].agentCommission
              );
              data.records[0].agentCommissionWithdraw = Number(
                data.records[0].agentCommissionWithdraw
              );
              data.records[0].balanceDifferent = Number(
                data.records[0].balanceDifferent
              );
              $scope.data = $scope.urlDecode(data.records[0]);

              // console.log($scope.data);
            }
            if (typeof data.records[0].balance != "undefined") {
              $scope.data.balance = Number(data.records[0].balance);
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

    $scope.maskText = function (ori) {
      var res = "";
      if (ori !== undefined) {
        for (i = 0; i < ori.length; i++) {
          if (i == 0 || i == ori.length - 1) {
            res = res.concat(ori.charAt(i));
          } else {
            res = res.concat("*");
          }
        }
      }
      return res;
    };

    $scope.toggleCheck = function () {
      for (var i = 0; i < $scope.merchants.length; i++) {
        $scope.merchants[i].check = $scope.checkall;
      }
    };

    $scope.save = function () {
      // $scope.data.phoneNumber =
      //   $stateParams.phoneNumber ?? $scope.data.Login ?? null;
      if ($scope.data.bankAccNo == "") {
        alert("Please input Bank Acc. No");
        return false;
      }
      if ($scope.data.bankAccName == "") {
        alert("Please input Bank Acc. Name");
        return false;
      }
      if ($scope.data.bankCode == "") {
        alert("Please pick bank");
        return false;
      }

      if (Number($scope.data.balance) < 0) {
        alert("Please input opening balance ");
        return false;
      }

      if ($scope.data.login == "") {
        alert("Please input login");
        return false;
      }
      if ($scope.data.password == "") {
        alert("Please input password");
        return false;
      }
      if ($scope.data.alias == "") {
        alert("Please input alias");
        return false;
      }

      if (Number($scope.data.dailylimit) < 0) {
        alert("Please input daily limit");
        return false;
      }

      if (Number($scope.data.dailywithdrawallimit) < 0) {
        alert("Please input daily withdrawal limit");
        return false;
      }

      if ($scope.data.phoneNumber == "" && $scope.data.type == "W") {
        alert("Please input phone number");
        return false;
      }

      if ($scope.data.phoneNumber == "") {
        alert("Please input phone number!");
        return false;
      }
      if ($scope.data.type == null || $scope.data.type.trim() === "") {
        alert("Please input type mybank!");
        return false;
      }
      if ($scope.data.automationStatus == "") {
        alert("Please input Automation Status!");
        return false;
      }

      if (
        Number($scope.data.minDeposit) < 0 ||
        Number($scope.data.minDeposit) > Number($scope.data.maxDeposit)
      ) {
        alert("Invalid deposit amount range");
        return false;
      }

      // if (!$scope.data.bankAccName.toUpperCase().includes("DM")) {
      //     if (
      //         $scope.data.opentype == "16" ||
      //         $scope.data.opentype == "24CI"
      //     ) {
      //         $scope.data.type = "A";
      //     } else if ($scope.data.opentype == "24CO") {
      //         $scope.data.type = "D";
      //     }
      // }

      var tmp = $scope.data;
      tmp.merchants = $scope.merchants;
      tmp.edit = $scope.edit.mode ? 1 : 0;

      var jsonData = CRYPTO.encrypt(tmp);

      $http({
        method: "POST",
        url: webservicesUrl + "/saveMasterMyBank.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Data Saved");
            $state.go("master-mybank");
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
      $state.go("master-mybank");
    };

    //-------GET OTHER MASTER------------------
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

    $scope.getLogin = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getMsLogin.php",
        data: { data: "" }, 
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", 
        },
      }).then(
        function mySuccess(response) {
          var data = response.data; 
          if (data.status.toLowerCase() == "ok") {
            $scope.phoneNumber = data.records;
            console.log($scope.Login); 
          } else {
            alert(data.message); 
          }
        },
        function myError(response) {
          console.log(response); 
        }
      );
    };

    $scope.pick = function (item) {
      $scope.data.phoneNumber =
        item.phoneNumber || $stateParams.data.phoneNumber;
      $scope.pickAccount = item;
      $scope.isShow = false;
    };

    $scope.hideDropdown = function () {
      setTimeout(function () {
        $scope.isShow = false;
        $scope.$apply();
      }, 200);
    };

    $scope.getMerchants = function () {
      var data1 = {
        bankaccountno:
          $stateParams.data == null ? "" : $stateParams.data.bankAccNo,
        bankcode: $stateParams.data == null ? "" : $stateParams.data.bankCode,
      };

      var jsonData = CRYPTO.encrypt(data1);

      $http({
        method: "POST",
        url: webservicesUrl + "/mybank_getMasterMerchant.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.merchants = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.validateNumberOnly = function (event) {
      console.log(event.keyCode);
    };

    $scope.getLoginType = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getLoginType.php",
        data: "",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.logintype = response.data.data;
          $scope.isSetMerchant = response.data.issetmerchant;
          console.log($scope.logintype);
          console.log($scope.isSetMerchant);
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.init = function () {
      $scope.getMasterBank();
      $scope.getMerchants();
      $scope.getLoginType();
      $scope.getLogin();
      // $scope.edit.mode = !!($stateParams.data && $stateParams.data.bankAccNo && $stateParams.data.bankAccNo.trim().length > 0);
      console.log($stateParams.data);
    if ($stateParams.data) {

      if ($stateParams.data.bankAccNo && $stateParams.data.bankAccNo.length > 0) {
        $scope.edit.mode = true;

        $scope.data.phoneNumber = $stateParams.data.phoneNumber;
        $scope.data.merchantCode = $stateParams.data.merchantcode;
        $scope.data.type = $stateParams.data.type;
        $scope.data.active = $stateParams.data.active;
        $scope.data.bankCode = $stateParams.data.bankCode;
        $scope.data.opentype = $stateParams.data.opentype;
        $scope.data.automationStatus = $stateParams.data.automationStatus;
        $scope.data.dailylimit = Number($stateParams.data.dailylimit);
        $scope.data.dailywithdrawallimit = Number($stateParams.data.dailywithdrawallimit);
        $scope.data.dailydepositlimit = Number($stateParams.data.dailydepositlimit);
        $scope.data.minDeposit = Number($stateParams.data.minDeposit);
        $scope.data.maxDeposit = Number($stateParams.data.maxDeposit);
        $scope.data.agentCommission = Number($stateParams.data.agentCommission);
      
        $scope.loadData();
    }} else {
        $state.go("master-mybank");
    }

      // // $scope.loadData();
      // if ($stateParams.data.bankAccNo.length > 0) {
      //   $scope.edit.mode = true;
      // }
      // if ($scope.edit.mode) {
      //   $scope.loadData();
      // }
    };
    $scope.init();
  },
]);

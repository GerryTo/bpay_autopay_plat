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
    
    // NEW: Handler when bank selection changes
    $scope.onBankChange = function() {
      console.log("Bank changed to:", $scope.data.bankCode);
      
      // Reset merchant selection
      $scope.merchants = [];
      $scope.checkall = false;
      
      // Re-load merchants based on new bank
      $scope.getMerchantsForBank($scope.data.bankCode);
    };
    
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
          
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            if (data.records.length > 0) {
              // Preserve important values before overwrite
              var preservedPhone = $scope.data.phoneNumber;
              var preservedBankCode = $scope.data.bankCode;
              
              data.records[0].dailywithdrawallimit = Number(data.records[0].dailywithdrawallimit);
              data.records[0].dailylimit = Number(data.records[0].dailylimit);
              data.records[0].dailydepositlimit = Number(data.records[0].dailydepositlimit);
              data.records[0].minDeposit = Number(data.records[0].minDeposit);
              data.records[0].maxDeposit = Number(data.records[0].maxDeposit);
              data.records[0].agentCommission = Number(data.records[0].agentCommission);
              data.records[0].agentCommissionWithdraw = Number(data.records[0].agentCommissionWithdraw);
              data.records[0].balanceDifferent = Number(data.records[0].balanceDifferent);
              
              $scope.data = $scope.urlDecode(data.records[0]);
              
              // Restore values if lost
              if (!$scope.data.phoneNumber && preservedPhone) {
                $scope.data.phoneNumber = preservedPhone;
              }
              if (!$scope.data.bankCode && preservedBankCode) {
                $scope.data.bankCode = preservedBankCode;
              }
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
            console.log("Phone numbers loaded:", $scope.phoneNumber);
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.pick = function (item, $event) {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
      
      console.log("Pick called:", item);
      $scope.data.phoneNumber = item.phoneNumber || item.phonenumber || "";
      $scope.pickAccount = item;
      $scope.isShow = false;
      
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.hideDropdown = function () {
      $timeout(function () {
        $scope.isShow = false;
      }, 300);
    };

    // NEW: Dynamic merchant loading based on selected bank
    $scope.getMerchantsForBank = function(selectedBankCode) {
      var targetBankCode = selectedBankCode || $scope.data.bankCode || ($stateParams.data ? $stateParams.data.bankCode : '');
      
      var data1 = {
        bankaccountno: $stateParams.data == null ? "" : $stateParams.data.bankAccNo,
        bankcode: targetBankCode
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
            const frequentlyUsed = [
              "BB88", "LGRB", "CTAPP", "D88", "BGTK", 
              "B777", "BJ001", "BHGO1149", "LB88-Agent", "BB88AGENT"
            ];
            const lessUsed = ["BB88V2", "D88V2", "LB88V2"];
            const bankCode = (targetBankCode || "").toLowerCase();

            let records = [];
            
            if (bankCode === "bkashm") {
              const bkashSpecial = ["D88xP", "LB88xP", "BBXP"];
              records = data.records
                .filter((m) => bkashSpecial.includes((m.merchantcode || "").trim()))
                .map((m) => ({
                  ...m,
                  check: m.check === true,
                  group: "BkashM Special",
                }));
              console.log("BkashM merchants loaded:", records.length);
            } else {
              records = data.records.map((m) => {
                const code = (m.merchantcode || "").trim();
                let group = "Other";
                if (frequentlyUsed.includes(code)) group = "Frequently Used";
                else if (lessUsed.includes(code)) group = "Less Used";
                return { ...m, check: m.check === true, group };
              });
              console.log("Regular merchants loaded:", records.length);
            }

            records.sort((a, b) => {
              const order = {
                "BkashM Special": 0,
                "Frequently Used": 1,
                "Less Used": 2,
                Other: 3,
              };
              return order[a.group] - order[b.group];
            });

            $scope.merchants = records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.getMerchants = function () {
      $scope.getMerchantsForBank();
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
          console.log("Login type:", $scope.logintype);
          console.log("Set merchant:", $scope.isSetMerchant);
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

      console.log("State params:", $stateParams.data);

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
        }
      } else {
        $state.go("master-mybank");
      }
    };
    
    $scope.init();
  },
]);
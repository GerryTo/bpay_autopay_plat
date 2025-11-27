app.controller("AutomationwithdrawListCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$uibModal",
  "$interval",
  "$rootScope",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $uibModal,
    $interval,
    $rootScope
  ) {

    $scope.getTransactionIdBgColor = function(entity) {
      if (entity.status !== 'Order need to check' || !entity.insert) return '';

      const now = new Date();
      const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const nowGmt8 = new Date(nowUtc.getTime() + 8 * 60 * 60 * 1000).getTime();
      const originalTime = new Date(entity.insert).getTime();
      const diff = nowGmt8 - originalTime;

      // if (diff < 180000) return 'lightgreen';
      if (diff >= 180000) return 'red';

      return '';
    };



    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      //minDate: new Date(),
      startingDay: 1,
    };
    $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };
    $scope.popup2 = {
      opened: false,
    };
    $scope.open2 = function () {
      $scope.popup2.opened = true;
    };
    $scope.filter = {
      fromdate: new Date(),
      todate: new Date(),
      history: false,
    };
    $scope.isAutomationOn = false;
    $scope.isAutomationOnBkash = false;
    $scope.statusService = "";
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "withdraw-list.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "FutureID",
          field: "id",
          aggregationType: uiGridConstants.aggregationTypes.count,
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        {
          name: "System Timestamp",
          field: "insert",
          sort: { direction: "desc" },
          width: 120,
        },
        { name: "MerchantID", field: "merchantcode", width: 120 },
        { name: "Customer Code", field: "customercode", width: 120 },
        //{ name: 'Currency', field: 'ccy', width:100 },
        {
          name: "Amount",
          field: "amount",
          type: "number",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
          width: 120,
        },
        { name: "Client Timestamp", field: "timestamp", width: 120 },
        { name: "Original Timestamp", field: "originaldate", width: 120, visible: false },
        //{ name: 'IP', field: 'ip' , width:150, hide:true},
        {
          name: "Bank",
          field: "bankcode",
          sort: { direction: "asc" },
          filter: { condition: uiGridConstants.filter.EXACT },
          width: 100,
        },
        { name: "Dest Bank Account", field: "dstbankaccount", width: 150 },
        { name: "Dest Account Name", field: "accountname", width: 150 },
        { name: "Source Bank", field: "sourcebankcode", width: 150 },
        { name: "Source Bank Account", field: "accountno", width: 150 },
        { name: "Source Account Name", field: "sourceaccountname", width: 150 },
        { name: "TransactionID", field: "transactionid", width: 100,
          cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `
         },
        {
          name: "Fee",
          field: "fee",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
          width: 100,
        },
        { name: "Status", field: "status", width: 150 },
        { name: "Notes 2", field: "notes2", width: 150 },
        { name: "Notes 3", field: "notes3", width: 150 },
        //{ name: 'Final Status', field: 'finalstatusdesc', width : 150 },
        { name: "Memo 2", field: "memo2", width: 100 },
        {
          name: "Action",
          field: "merchantcode",
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-show="false" ng-click="grid.appScope.edit(row.entity)">Edit</button>' +
            ' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>' +
            ' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>' +
            // +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.ibft(row.entity)" ng-show="row.entity.allowresend == \'1\' ">Resend</button>'
            ' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.id)" ng-show="row.entity.status == \'Order need to check\'">Success</button>' +
            // +' <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\' || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'">Receipt</button>'
            ' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.TimeOut(row.entity.id)" ng-show="false">Order need to check</button>' +
            ' <button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.updateMemo2(row.entity)">Update Memo 2</button>',
          width: 260,
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };
    $scope.add = function (notification) {
      var i;
      if (!notification) {
        $scope.invalidNotification = true;
        return;
      }

      i = index++;
      $scope.invalidNotification = false;
      $scope.notifications[i] = notification;
    };

    $scope.updateMemo2 = function (dataParam) {
      console.log(dataParam);

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'js/Modal/UpdateMemo2Modal/updateMemo2Modal.html',
        controller: 'updateMemo2Ctrl',
        size: 'lg',
        scope: $scope,
      });

      modalInstance.result.then(function (returnValue) {
        var data = {
          futuretrxid: dataParam.id,
          memo2: returnValue.memo2,
          ishistory: $scope.filter.history
        };
        // console.log(data);

        $http({
          method: "POST",
          url: webservicesUrl + "/updateMemo2.php",
          data: { 'data': data },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
          var data = response.data;
          // console.log(data);
          if (data.status == 'ok') {
            alert(data.message);
            $scope.getListData();
          } else {
            alert(data.message);
          }
        }, function myError(response) {
          console.log(response);
        });

      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
    }

    $scope.getCurrentAutomation = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawList_getCurrentAutomation.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          // console.log(response.data);
          if (response.data.status == "ok") {
            $scope.isAutomationOn = response.data.records.current_status == "Y";
          } else {
            console.log("error: ", response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.getCurrentAutomationBkash = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawList_getCurrentAutomationBkash.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          // console.log(response.data);
          if (response.data.status == 'ok') {
            $scope.isAutomationOnBkash = response.data.records.current_status == 'Y';
          } else {
            console.log('error: ', response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    }

    $scope.automationChange = function () {
      // console.log($scope.isAutomationOn);
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawList_setAutomation.php",
        data: { status: $scope.isAutomationOn ? "Y" : "N" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          if (response.data.status != "ok") {
            console.log(response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.automationChangeBkash = function () {
      // console.log($scope.isAutomationOnBkash)
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawList_setAutomationBkash.php",
        data: { status: $scope.isAutomationOnBkash ? 'Y' : 'N' },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          if (response.data.status != 'ok') {
            console.log(response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    }

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { 'datefrom': from, 'dateto': to, 'history': $scope.filter.history };
      // console.log(data);
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/getAutomationWithdrawList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(response.data.data);
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
            // console.log(data.records);
            var records = data.records;
            records.forEach(function (record) {
              record.sourceaccountname = decodeURIComponent(record.sourceaccountname);
            });
            $scope.gridOptions.data = records;
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

    $scope.Fail = function (dataParam) {
      var data = { id: dataParam, fail: "Y" };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url:
          webservicesUrl +
          "/changeStatusSuccessTransactionAccountByCompany.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Success!");
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };
    $scope.TimeOut = function (dataParam) {
      var data = { id: dataParam, timeOut: "Y", typeWidhdrawList: "1" };
      // console.log(data);
      //return false;
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url:
          webservicesUrl +
          "/changeStatusSuccessTransactionAccountByCompany.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Success!");
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    /**
     *
     * update by Rusman
     * 2021-01-27
     * add check function
     */

    $scope.check = function (id) {
      var data = { id: id };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/withdrawList_checkAutomation.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            //alert('Success!');
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response);
        }
      );
    };

    $scope.SuccessWithUploadReceipt = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/successModal.html?v=" + new Date().getTime(),
        controller: "successModalCtrl",
        size: "md",
        scope: $scope,
      });

      modalInstance.result.then(
        function (returnValue) {
          var data = {
            id: dataParam,
            account: returnValue.accountDest,
            bankcode: returnValue.bankCode,
            receipt: returnValue.receiptFile,
          };

          var jsonData = CRYPTO.encrypt(data);
          $http({
            method: "POST",
            url:
              webservicesUrl +
              "/changeStatusSuccessTransactionAccountByCompany.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Success!");
                $scope.getListData();
              } else {
                alert(data.message);
              }
            },
            function myError(response) {
              console.log(response);
            }
          );
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.Success = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/accountModal.html?v=2",
        controller: "selectAccountSourceModalCtrl",
        size: "sm",
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) {
          if (returnValue.length > 3) {
            var data = { id: dataParam, account: returnValue };

            var jsonData = CRYPTO.encrypt(data);
            $http({
              method: "POST",
              url:
                webservicesUrl +
                "/changeStatusSuccessTransactionAccountByCompany.php",
              data: { data: jsonData },
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8",
              },
            }).then(
              function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == "ok") {
                  alert("Success!");
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
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.edit = function (data) {
      //$state.go('withdraw-form', { data: { merchantcode: data.merchantcode, customercode:data.customercode, id:data.id, bankcode:data.bankcode, amount:data.amount, accountno:data.accountno, dstbankaccount:data.dstbankaccount, merchant:data.merchant, ccy:data.ccy , FutureID:data.id } });
    };

    $scope.autosend = function () {
      //console.log("Begin");
      var totalPending = 0;
      $scope.getListData();

      for (i = 0; i < $scope.gridOptions.data.length; i++) {
        if ($scope.gridOptions.data[i].status == "Pending") {
          totalPending++;
          //$state.go('withdraw-form', { data: { merchantcode: $scope.gridOptions.data[i].merchantcode, customercode:$scope.gridOptions.data[i].customercode, id:$scope.gridOptions.data[i].id, bankcode:$scope.gridOptions.data[i].bankcode, amount:$scope.gridOptions.data[i].amount, accountno:$scope.gridOptions.data[i].accountno, dstbankaccount:$scope.gridOptions.data[i].dstbankaccount, merchant:$scope.gridOptions.data[i].merchant, ccy:$scope.gridOptions.data[i].ccy , FutureID:$scope.gridOptions.data[i].id } });
          //break;
        }
      }
      if (totalPending != $scope.currentPending && totalPending > 0) {
        console.log("Call");
        var audio = new Audio("audio/bell_ring.mp3");
        audio.play();
        $scope.currentPending = totalPending;
      }
      $timeout(function () {
        $scope.autosend();
      }, 10000);
    };
    $scope.delete = function (data) {
      if (confirm("Are you sure want to delete [" + data.merchantname + "]?")) {
        /*
            var data = { merchantcode: data.merchantcode };
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/deleteMasterMerchant.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    $scope.getProducts();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
*/
      }
    };

    $scope.updateTrx = function (manualstatus, id, accountdest, memo = "") {
      var data = {
        id: id,
        status: manualstatus,
        accountdest: accountdest,
        memo: memo,
      };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/automation_updateManualTransaction.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Data Saved");
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.cancel = function (data) {
      if (
        confirm("Are you sure want to fail this transaction [" + data.id + "]?")
      ) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "templates/failModal.html?v=2",
          controller: "failModalCtrl",
          size: "sm",
          scope: $scope,
        });

        modalInstance.result.then(
          function (returnValue) {
            //alert(returnValue)
            $scope.updateTrx("C", data.id, "", returnValue);
          },
          function () {
            console.log("Modal dismissed at: " + new Date());
          }
        );
      }
    };

    //----IBFT-----
    $scope.dataIbft = {
      bank: "",
      amount: 0,
      merchantCode: "",
      customerCode: "",
      transactionId: "",
      futureId: "",
      responseUrl: "",
      usr: "",
      pass: "",
    };
    $scope.reconnect = false;
    $scope.wsUrl = "ws://54.169.49.182:8081";
    $scope.ws = null;
    $scope.ackinterval = null;

    $scope.sendACK = function () {
      var request = { action: "ACK" };
      if ($scope.ws.readyState < 3) {
        $scope.ws.send(JSON.stringify(request));
      } else {
        console.log("Please restart connection");
      }
    };

    $scope.Request = function () {
      console.log("request");
      var request = {
        action: "Open",
        bank: $scope.dataIbft.bank,
        username: $scope.dataIbft.usr,
        password: $scope.dataIbft.pass,
        FutureId: $scope.dataIbft.futureId,
      };
      if ($scope.ws.readyState < 3) {
        $scope.ws.send(JSON.stringify(request));

        $scope.ackinterval = $interval(function () {
          $scope.sendACK();
          console.log("Send ACK");
        }, 30000);
      } else {
        console.log("Please restart connection");
      }
    };

    $scope.TACINVALID = function () {
      var request = {
        action: "TacInvalid",
        bank: $scope.dataIbft.bank,
        FutureId: $scope.dataIbft.futureId,
      };
      if ($scope.ws.readyState < 3) {
        //$scope.getException('20');
        //window.location.replace($scope.reurl);
        //ws.send(JSON.stringify(request));
        //$scope.progress=1;
        //$interval(function(){
        //               $scope.sendACK();
        //              console.log("Send ACK");
        //window.location.replace($scope.reurl);
        //            },60000)
      } else {
        console.log("Please restart connection");
      }
    };

    $scope.TACTIMEOUT = function () {
      var request = {
        action: "TACTimeout",
        bank: $scope.dataIbft.bank,
        FutureId: $scope.myData.futureId,
      };
      //$scope.ws.send(JSON.stringify(request));
      if ($scope.ws.readyState < 3) {
        console.log("TAC Timeout!");
        ws.send(JSON.stringify(request));
      } else {
        console.log("Please restart connection");
      }
    };

    $scope.onOpen = function () {
      console.log("Socket has been opened!");
      $scope.Request();
    };
    $scope.onError = function (err) {
      console.log(err);
    };

    $scope.onClose = function () {
      //$scope.errorMessage="Connection is closed ...";
      //$scope.$apply();
      if ($scope.reconnect) {
        setTimeout(function () {
          $scope.ws = new WebSocket($scope.wsUrl);
          //$scope.errorMessage="Reconnect";
          //$scope.$apply();
        }, 2000);
      } else {
        if ($scope.ackinterval) clearInterval($scope.ackinterval);
        $scope.ws = null;
      }
    };

    $scope.onMessage = function (message) {
      var replyData = JSON.parse(message.data);
      var bank = "";
      console.log(replyData);
      if (replyData.action == "Open") {
        if (replyData.messages == "TTAC") {
          setTimeout(function () {
            $http({
              method: "POST",
              url: webservicesUrl + "/getTAC.php",
              data: { bank: $scope.dataIbft.bank },
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8",
              },
            }).then(
              function mySuccess(response) {
                //var data = CRYPTO.decrypt(response.data.data);
                var data = $scope.urlDecode(response.data);
                if (data.status.toLowerCase() == "ok") {
                  var token = data.records;
                  var request = {
                    action: "TTAC",
                    bank: $scope.dataIbft.bank,
                    tac: token,
                    FutureId: $scope.dataIbft.futureId,
                  };
                  $scope.ws.send(JSON.stringify(request));
                } else {
                  alert(data.message);
                }
              },
              function myError(response) {
                console.log(response.status);
              }
            );
          }, 30000);
        } else if (replyData.messages == "TAC") {
          setTimeout(function () {
            $http({
              method: "POST",
              url: webservicesUrl + "/getTAC.php",
              data: { bank: $scope.dataIbft.bank },
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8",
              },
            }).then(
              function mySuccess(response) {
                //var data = CRYPTO.decrypt(response.data.data);
                var data = $scope.urlDecode(response.data);
                if (data.status.toLowerCase() == "ok") {
                  var token = data.records;
                  var request = {
                    action: "TAC",
                    bank: $scope.dataIbft.bank,
                    tac: token,
                    FutureId: $scope.dataIbft.futureId,
                  };
                  $scope.ws.send(JSON.stringify(request));
                } else {
                  alert(data.message);
                }
              },
              function myError(response) {
                console.log(response.status);
              }
            );
          }, 30000);
        } else if (replyData.messages == "Invalid") {
          alert("Invalid User / password");
        } else if (replyData.messages == "ACCOUNT") {
          $scope.accounts = replyData.source;
          $scope.dataIbft.acc = $scope.accounts[0].id;
        } else if (replyData.messages == "Invalid Data") {
        }
      } else if (replyData.action == "TAC") {
        if (replyData.messages == "Transfer Success") {
          alert("Transfer Success");
          /*setTimeout(function () {
                    window.location.replace($scope.reurl);
                },20000);*/
          $scope.reconnect = false;
        } else {
          $scope.TACINVALID();
        }
      } else if (replyData.action == "APPLI2") {
        console.log("BEGIN APLI 2");
        //$scope.dataIbft.BCAAPLI = replyData.messages;
      } else if (replyData.action == "SecureTAC") {
        console.log("Begin Secure TAC");
      } else if (replyData.action == "Progress") {
        console.log("progress " + replyData.messages);
        console.log(replyData);
      } else if (replyData.action == "SECRET") {
        //$scope.question=replyData.messages;
      } else if (replyData.action == "Exception") {
        console.log("Exception ERROR!");
        $scope.getException(replyData.messages);
      }
    };

    $scope.getException = function (Item) {
      var idException = Item;

      $http({
        method: "POST",
        url: webservicesUrl + "/getException.php",
        data: { data: idException },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = $scope.urlDecode(response.data);
          if (data.status.toLowerCase() == "ok") {
            var titleException = decodeURIComponent(data.records[0].title);
            var notificationException = decodeURIComponent(
              data.records[0].notification
            );
            alert(notificationException);
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.ibft = function (data) {
      if (
        confirm(
          "Are you sure want to Resend transaction [Future ID: " +
          data.id +
          "] ?"
        )
      ) {
        /*$http({
                method: "POST", 
                url: webservicesUrl + "/getMerchantUsrPass.php",
                data: { 'bank': data.bankcode == 'RHB' ? 'CIMBB' : 'RHB', 'merchantcode': data.merchantcode, 'futureid': data.id },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                


                var datares = CRYPTO.decrypt(response.data.data);
                if (datares.status.toLowerCase() == 'ok') {
                    
                    $scope.dataIbft = {
                        bank: data.bankcode == 'RHB' ? 'IBFTC' : 'IBFTR',
                        amount: data.amount,
                        merchantCode: data.merchantcode,
                        customerCode: data.customercode,
                        transactionId: data.transactionid,
                        futureId: data.id,
                        responseUrl:'',
                        usr:datares.usr,
                        pass:datares.pass
                    }
                    
                    if($scope.ws == null ){
                        $scope.ws = new WebSocket($scope.wsUrl);
                        $scope.ws.onopen = $scope.onOpen;
                        $scope.ws.onerror = $scope.onError;
                        $scope.ws.onclose = $scope.onClose;
                        $scope.ws.onopen = $scope.onOpen;
                    }else{
                        if($scope.ws.readyState == 3){
                            $scope.ws = new WebSocket($scope.wsUrl);
                        }
                    }
                    $scope.reconnect = true;
                    $scope.start();

                } else {
                    alert(datares.message);
                }
            }, function myError(response) {
                console.log(response.status);
            });*/

        var tmp = {
          merchantcode: data.merchantcode,
          customercode: data.customercode,
          currency: data.ccy,
          destbankcode: data.bankcode,
          amount: data.amount,
          transactionid: data.transactionid,
          reference: data.reference,
          timestamp: data.timestamp,
          ip: data.ip,
          responseurl: data.responseurl,
          backendurl: data.backendurl,
          destaccno: data.dstbankaccount,
          destaccname: data.accountname,
          sourcebankcode: data.sourcebankcode,
          futureid: data.id,
        };

        $http({
          method: "POST",
          url: webservicesUrl + "/requeue_ibft.php",
          data: tmp,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            //var datares = CRYPTO.decrypt(response.data.data);
            if (response.data.status.toLowerCase() == "ok") {
              alert("Resend Success");
              $scope.getListData();

              //window.open(response.data.url, '_blank');
            } else {
              alert(response.data.message);
            }
          },
          function myError(response) {
            console.log(response.status);
          }
        );
      }
    };

    $scope.start = function () {
      console.log("start");
      console.log($scope.ws.readyState);
      if ($scope.ws.readyState != 1) {
        setTimeout(function () {
          $scope.start();
        }, 2000);
      } else {
        $scope.Request();
      }
    };
    //----END IBFT-----

    $scope.receipt = function (data) {
      console.log(data);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/picModal.html?v=4",
        controller: "picModalCtrl",
        size: "lg",
        resolve: {
          futuretrxid: function () {
            return data.futuretrxid;
          },
          piclocation: function () {
            return data.location;
          },
        },
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) { },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.Manual = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/accountModal.html",
        controller: "selectAccountModalCtrl",
        size: "sm",
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) {
          if (returnValue.length > 3) {
            $scope.updateTrx("E", data.id, returnValue);
            //console.log("return value "+returnValue);
          }
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.getStatusService = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/get_status_serviceautoassign.php",
        data: {},
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          console.log(response.data);
          if (response.data.status.toLowerCase() == "ok") {
            $scope.statusService = response.data.records[0].v_servicestatus
          } else {
            alert(response.data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    }

    $scope.init = function () {
      $scope.getListData();
      $scope.getStatusService();
      $scope.getCurrentAutomation();
      $scope.getCurrentAutomationBkash();
      /*$timeout(function(){
      $scope.autosend();
        },10000);*/
      $timeout(function () {
        $scope.getListData();
      }, 60000);

      $rootScope.pageInterval = $interval(function () {
        $scope.getCurrentAutomation();
      }, 30000);
      //$scope.add("Test");
    };
    $scope.init();
  },
]);

app.controller("selectAccountModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "$http",
  function ($scope, $uibModalInstance, $uibModal, $http) {
    $scope.accountdest = "";
    $scope.accountlist = [];
    $scope.getListAccount = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getMasterIBFT.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.accountlist = data.records;
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.save = function () {
      $uibModalInstance.close($scope.accountdest);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
    $scope.getListAccount();
  },
]);

app.controller("failModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "$http",
  function ($scope, $uibModalInstance, $uibModal, $http) {
    $scope.memo = "";
    $scope.save = function () {
      $uibModalInstance.close($scope.memo);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);

app.controller("picModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "$http",
  "futuretrxid",
  "piclocation",
  function (
    $scope,
    $uibModalInstance,
    $uibModal,
    $http,
    futuretrxid,
    piclocation
  ) {
    $scope.data = {
      futuretrxid: futuretrxid,
      piclocation: piclocation,
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);

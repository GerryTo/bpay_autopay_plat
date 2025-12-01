app.controller("newDepositListCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$stateParams",
  "$uibModal",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal
  ) {
    //$scope.products = [];
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };
    $scope.Balance = {};
    $scope.Summary = {
      pendingDB: 0,
      pendingCR: 0,
      DB: 0,
      CR: 0,
      fee: 0,
    };
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      minDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
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
      dateFrom: new Date(),
      dateTo: new Date(),
      filter: "",
      history: false,
    };
    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };
    $scope.getAgentList = function () {
      $http({
          method: "POST",
          url: webservicesUrl + "/getMasterMyBankNew.php",
          data: { 'data': '' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
          console.log("Response from server:", response);
          var data = CRYPTO.decrypt(response.data.data);
          console.log("Decrypted data:", data);
  
          if (data.status.toLowerCase() == 'ok') {
              let unique = {};
              let deduplicated = [];
  
              data.records.forEach(function (item) {
                  if (!unique[item.bankAccNo]) {
                      unique[item.bankAccNo] = true;
                      deduplicated.push(item);
                  }
              });
              // console.log(data.records);
              $scope.agentList = deduplicated;
              console.log($scope.agentList)
              if (deduplicated.length > 0) {
                  $scope.filter.account = deduplicated[0].account;
              }
          } else {
              alert(data.message);
          }
      }, function myError(response) {
          console.log(response.status);
      });
  };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "transaction-by-id.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          aggregationType: uiGridConstants.aggregationTypes.count,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        { name: "Date", field: "insert", width: 150 },
        { name: "Date GMT+6", field: "insertGmt6", width: 150 },
        { name: "Complete Date", field: "completedate", width: 150 },
        { name: "Complete Date GMT+6", field: "completedateGmt6", width: 150 },
        { name: "Merchant Code", field: "merchantcode", width: 100 },
        { name: "Customer Code", field: "customercode", width: 180 },
        { name: "CCY", field: "ccy", visible: false },
        {
          name: "Bank",
          field: "bankcode",
          sort: { direction: "asc" },
          width: 100,
        },
        {
          name: "Debit",
          field: "DB",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        {
          name: "Credit",
          field: "CR",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "IP", field: "ip", visible: false },
        { name: "Trans Type", field: "transactiontype", width: 100 },
        { name: "Status", field: "status", width: 120 },
        // { name: "Memo", field: "memo", width: 100 },
        {
          name: "Callback Status",
          field: "callbackresponse",
          width: 150,
          cellTooltip: function (row, col) {
            return row.entity.callbackresponse;
          },
        },
        { name: "Account Src", field: "accountsrc", visible: false },
        {
          name: "Fee",
          field: "fee",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "Notes", field: "notes", width: 150 },
        { name: "Notes 2", field: "notes2", width: 150 },
        { name: "Notes 3", field: "notes3", width: 150 },
        { name: "Sms Phone", field: "phonenumber", width: 150 },
        { name: "Sms Agent", field: "user", width: 150 },
        //{ name: 'Actual Transaction Date', field: 'notesactualdate' , width:150},
        { name: "Trans ID", field: "transactionid", width: 100 },
        { name: "Reference", field: "reference", visible: false },
        { name: "Alias", field: "alias", width: 100 },
        { name: "Actual Agent", field: "actualAgent", width: 100 },
        { name: "Acc Source", field: "accountno", width: 100 },
        { name: "Acc Source Name", field: "accountsrcname", width: 100 },
        { name: "Acc Dest", field: "accountdst", width: 100 },
        { name: "Acc Dest Name", field: "accountdstname", width: 100 },
        // { name: "Server Name", field: "servername", width: 100 },
        // { name: "Server URL", field: "serverurl", width: 100 },
        { name: "dis", field: "disable", visible: false },
        { name: "Receipt ID", field: "notes2", width: 100 },
        { name: "Matching Source", field: "memo", width: 100 },
        { name: "Matching Details", field: "memo3", width: 100 },
        { name: "Memo 2", field: "memo2", width: 100 },
        {
          name: "Action",
          field: "futuretrxid",
          cellTemplate:
            ' <button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.updateMemo2(row.entity)">Update Memo 2</button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.analyze(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Analyze</button>',
          width: 260,
        },
        // {
        //   name: "Action",
        //   field: "futuretrxid",
        //   width: 400,
        //   cellTemplate:
        //     '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Edit</button>' +
        //     '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>' +
        //     // '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.resend(row.entity)" ng-show="false">Resend</button>' +
        //     '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessDeposit(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\' " ng-disabled="row.entity.disable ==\'1\'" >Success</button>' +
        //     // '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessDepositDiffAgent(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\' " ng-disabled="row.entity.disable ==\'1\'" >Success diff agent</button>' +
        //     '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'W\' "  ng-disabled="row.entity.disable ==\'1\'" >Success</button>' +
        //     '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.matchingTrxId(row.entity.futuretrxid, row.entity.transactionid, row.entity.notes3)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\' " ng-disabled="row.entity.disable ==\'1\'" >Rematch Trx ID</button>' +
        //     //
        //     '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'W\' "  ng-disabled="row.entity.disable ==\'1\'" >Matching Trx ID</button>' +
        //     // '<button type="button" class="btn btn-default btn-sm" style="margin-right:2px;" ng-click="grid.appScope.Mutasi(row.entity)" ng-show="(row.entity.status == \'Order need to check\' || row.entity.status == \'Transaction Success\' ) && row.entity.transactiontype == \'D\' && row.entity.matchMutasi == \'0\'"  >Mutasi</button>' +
        //     // '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\'" || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'" >Receipt</button>' +
        //     '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.Approve(row.entity.futuretrxid)" ng-show="grid.appScope.validate(row.entity)" >Approve</button>' +
        //     '<button type="button" class="btn btn-default btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ResendCallback(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\'" >Resend CB</button>',
        // },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.edit = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/TransactionEditModal/TransactionEditModal.template.html?v=2",
        controller: "transactionEditModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {
          params: function () {
            return data;
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var params = {
            id: data.futuretrxid,
            amount: returnValue.amount,
            note: returnValue.note,
          };

          var jsonData = CRYPTO.encrypt(params);
          $http({
            method: "POST",
            url: webservicesUrl + "/transactionByAccount_edit.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Edit Amount Success!");
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

    $scope.analyze = function (params) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/CheckDepositModal/CheckDepositModal.template.html?v=" +
          new Date().getTime(),
        controller: "CheckDepositModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return { futuretrxid: params.futuretrxid, trxid: params.notes3 };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          // if (returnValue.type == 1) {
          //   //continue matching
          //   $scope.sms(params);
          // } else if (returnValue.type == 2) {
          //   //failed
          //   $scope.cancel(params);
          // } else if (returnValue.type == 3) {
          //   $scope.SuccessDeposit(params.futuretrxid);
          // }
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.updateMemo2 = function (dataParam) {
      console.log(dataParam);

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "js/Modal/UpdateMemo2Modal/updateMemo2Modal.html",
        controller: "updateMemo2Ctrl",
        size: "lg",
        scope: $scope,
      });

      modalInstance.result.then(
        function (returnValue) {
          date = $scope.convertJsDateToString($scope.filter.date);
          today = new Date();
          today = $scope.convertJsDateToString(today);
          var yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday = $scope.convertJsDateToString(yesterday);

          if (date != today && date != yesterday) {
            $scope.filter.history = true;
          }
          console.log($scope.filter.history);
          var data = {
            futuretrxid: dataParam.futuretrxid,
            memo2: returnValue.memo2,
            ishistory: $scope.filter.history,
          };
          console.log(data);

          $http({
            method: "POST",
            url: webservicesUrl + "/updateMemo2.php",
            data: { data: data },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = response.data;
              console.log(data);
              if (data.status == "ok") {
                alert(data.message);
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

    $scope.bulkFail = function () {
    var selected = $scope.gridApi.selection.getSelectedRows();
    if (selected.length === 0) {
        alert("No transactions selected!");
        return;
    }
    // Buka modal untuk ambil MEMO, futuretrxid tidak dibawa ke modal!
    var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "js/Modal/FailModalNew/FailModalNew.template.html?v=2",
        controller: "FailModalNewCtrl",
        size: "sm",
        scope: $scope,
        resolve: {
            items: function () {
                return { transactiontype: "D" };
            }
        }
    });
    modalInstance.result.then(
        function (memoFromUser) {
            // Setelah modal return memo → kirim bulk ke backend
            $scope.sendBulkFail(selected, memoFromUser);
        },
        function () {
            console.log("Modal dismissed");
        }
      );
    };

    $scope.sendBulkFail = function (rows, memo) {

        if (!confirm("Are you sure to FAIL all selected transactions?")) {
            return;
        }
        // Format bulk harus sama seperti upline: array of items
        var items = [];
        for (var i = 0; i < rows.length; i++) {
            items.push({
                futuretrxid: rows[i].futuretrxid, // FUTURE TRX ID DARI SELECTION
                memo: memo                         // MEMO DARI MODAL
            });
        }
        var payload = {
            type: "bulkFailDeposit",
            items: items
        };
        var encrypted = CRYPTO.encrypt(payload);
        $http({
            method: "POST",
            url: webservicesUrl + "/transaction_bulkFail.php",
            data: { data: encrypted },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
        }).then(
            function (response) {
                var data = CRYPTO.decrypt(response.data.data);

                if (data.status.toLowerCase() === "ok") {
                    alert("Bulk Fail completed successfully!");
                } else {
                    alert(data.message);
                }

                $scope.getListData();
            },
            function (err) {
                console.log(err);
            }
        );
    };



    $scope.validate = function (row) {
      //((row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Pending\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Transaction Failed\' && row.entity.transactiontype == \'D\')) && row.entity.disable ==\'1\' && (\''+$scope.currentLoginInfo.type+'\'==\'S\' || \''+$scope.currentLoginInfo.type+'\' == \'A\')
      if (
        ((row.status == "Order need to check" && row.transactiontype == "D") ||
          (row.status == "Pending" && row.transactiontype == "D") ||
          (row.status == "Transaction Failed" && row.transactiontype == "D")) &&
        row.disable == "1" &&
        $scope.currentLoginInfo.type == "S"
      )
        return true;
      else return false;
    };

    $scope.ResendCallback = function (dataParam) {
      var params = { futuretrxid: dataParam.futuretrxid };

      var jsonData = CRYPTO.encrypt(params);
      $http({
        method: "POST",
        url: webservicesUrl + "/transactionById_resendCallback.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            alert("Resend Callback Success!");
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

    $scope.Mutasi = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "js/Modal/MutasiModal/MutasiModal.template.html?v=2",
        controller: "MutasiModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              bank: dataParam.bankcode,
              accountNo: dataParam.accountdst,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var params = {
            futuretrxid: dataParam.futuretrxid,
            id: returnValue.id,
          }; // id : array()

          var jsonData = CRYPTO.encrypt(params);
          $http({
            method: "POST",
            url: webservicesUrl + "/depositQueue_matchedMutasi.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Mutasi Matching Success!");
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

    $scope.edit = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/TransactionEditModal/TransactionEditModal.template.html?v=2",
        controller: "transactionEditModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {
          params: function () {
            return data;
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var params = {
            id: data.futuretrxid,
            amount: returnValue.amount,
            note: returnValue.note,
            destAccNo: returnValue.accountno,
          };

          var jsonData = CRYPTO.encrypt(params);
          $http({
            method: "POST",
            url: webservicesUrl + "/transactionByAccount_edit.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              var data = CRYPTO.decrypt(response.data.data);
              if (data.status.toLowerCase() == "ok") {
                alert("Edit Amount Success!");
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

    /*SUCCESS DEPOSI*/

    $scope.SuccessDeposit = function (dataParam) {
      /**
       *  update by Rusman
       *  2021-01-25
       *  add new logic for deposit manual
       */

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "templates/successDepositManualModal.html?v=" + new Date().getTime(),
        controller: "successDepositManualModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {
          dataParam: function () {
            return dataParam;
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          var data = {
            id: dataParam,
            transid: returnValue.transid,
            change: returnValue.change ? 1 : 0,
            actualAgent: returnValue.user,
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
                console.log(data.message);
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

    $scope.SuccessDepositDiffAgent = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/SuccessTransactionDiffAgentModal/SuccessTransactionDiffAgentModal.template.html?v=" +
          new Date().getTime(),
        controller: "successTransactionDiffAgentModalCtrl",
        size: "md",
        scope: $scope,
      });

      modalInstance.result.then(
        function (returnValue) {
          console.log(returnValue);
          var data = {
            id: dataParam,
            transid: returnValue.transid,
            actualAgent: returnValue.user,
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
                console.log(data.message);
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

    $scope.matchingTrxId = (id, transid, notes3) => {
      // console.log(transid);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/transactionUpdateNotes3/transactionUpdateNotes3Modal.template.html?v=2",
        controller: "transactionUpdateNotes3ModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {
          dataParam: function () {
            return { id, transid, notes3 };
          },
        },
      });

      modalInstance.result.then(
        (success = (callback) => {
          var futureId = id;
          var trxId = callback.notes3;

          var notes3 = {
            id: futureId,
            notes: trxId,
            history: $scope.filter.history,
          }; // for update notes3
          var sms = { id: trxId, history: $scope.filter.history }; // for checking smslog
          var manual = { id: futureId, transid: transid }; // for success manual

          $scope.updateNotes3(notes3, sms, manual); // update note and more action
        }),
        (err) => {
          console.log(err);
        }
      );
    };

    $scope.updateNotes3 = function (data, sms, manual) {
      // update notes
      $http({
        method: "POST",
        url: webservicesUrl + "/transactionUpdateNotesById.php",
        data: { data: CRYPTO.encrypt(data) },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(res) {
          var result = CRYPTO.decrypt(res.data.data);
          if (result.status.toLowerCase() == "ok") {
            alert("Success");
            $scope.getListData();
            // $scope.checkingSmsLog(sms, manual);
          } else {
            alert(result.message);
          }
          return true;
        },
        function myError(err) {
          console.log(err);
        }
      );
    };

    $scope.checkingSmsLog = function (data, manual) {
      // checking & getting smsLog
      $http({
        method: "post",
        url: webservicesUrl + "/smsLog_getById.php",
        data: { data: CRYPTO.encrypt(data) },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(res) {
          var result = CRYPTO.decrypt(res.data.data);
          console.log(result);
          if (
            result.status.toLowerCase() == "ok" &&
            result.records.length > 0
          ) {
            // ok and not empty records
            for (let i = 0; i < result.records.length; i++) {
              if (result.records[i].futuretrxid == "") {
                // fixing get same futureid
                var value = {
                  futuretrxid: manual.id,
                  amount: result.records[i].amount,
                  bank: result.records[i].type,
                  trxid: result.records[i].securitycode,
                  phonenumber: result.records[i].customerphone,
                };
              }
            }
            $scope.sendMatching(value, manual);
          } else {
            // popup success manual
            $scope.errorMatching(manual);
          }
          return false; // unknow response
        },
        function myError(err) {
          // $scope.errorMatching();
          console.log(err);
        }
      );
    };

    $scope.sendMatching = function (data, manual) {
      // send matching
      $http({
        method: "POST",
        url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
        data: { data: CRYPTO.encrypt(data) },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(res) {
          var result = CRYPTO.decrypt(res.data.data);
          if (result.status.toLowerCase() == "ok") {
            $scope.checkingSmsLog(sms, manual);
          }
          return true;
        },
        function myError(err) {
          console.log(err);
        }
      );
    };

    $scope.checkingSmsLog = function (data, manual) {
      // checking & getting smsLog
      $http({
        method: "post",
        url: webservicesUrl + "/smsLog_getById.php",
        data: { data: CRYPTO.encrypt(data) },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(res) {
          var result = CRYPTO.decrypt(res.data.data);
          console.log(result);
          if (
            result.status.toLowerCase() == "ok" &&
            result.records.length > 0
          ) {
            // ok and not empty records
            for (let i = 0; i < result.records.length; i++) {
              if (result.records[i].futuretrxid == "") {
                // fixing get same futureid
                var value = {
                  futuretrxid: manual.id,
                  amount: result.records[i].amount,
                  bank: result.records[i].type,
                  trxid: result.records[i].securitycode,
                  phonenumber: result.records[i].customerphone,
                };
              }
            }
            $scope.sendMatching(value, manual);
          } else {
            // popup success manual
            $scope.errorMatching(manual);
          }
          return false; // unknow response
        },
        function myError(err) {
          // $scope.errorMatching();
          console.log(err);
        }
      );
    };

    $scope.sendMatching = function (data, manual) {
      // send matching
      $http({
        method: "POST",
        url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
        data: { data: CRYPTO.encrypt(data) },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(res) {
          var result = CRYPTO.decrypt(res.data.data);
          if (result.status.toLowerCase() == "ok") {
            // matching success
            alert("Success!");
            $scope.getListData();
          } else {
            // matching fail
            $scope.errorMatching(manual);
          }
          return false; // unknow response
        },
        function myError(err) {
          console.log(err);
        }
      );
    };

    $scope.errorMatching = function (data) {
      // manual success
      var answer = window.confirm("Match failed, do you want manual success?");
      if (answer) {
        // confirm
        $http({
          method: "POST",
          url:
            webservicesUrl +
            "/changeStatusSuccessTransactionAccountByCompany.php",
          data: { data: CRYPTO.encrypt(data) },
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
              $scope.getListData();
            }
          },
          function myError(response) {
            console.log(response);
          }
        );
      } else {
        $scope.getListData();
        console.log("closed");
      }
    };

    $scope.resend = function (data) {
      if (confirm("are you sure want to resend this transaction?")) {
        var data = { id: data.futuretrxid };
        var jsonData = CRYPTO.encrypt(data);

        $http({
          method: "POST",
          url: webservicesUrl + "/resendTransaction.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              alert("Resend Success");
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

    $scope.Approve = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/approveModal.html",
        controller: "approveModalCtrl",
        size: "sm",
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) {
          if (returnValue.wasabi == 1) {
            var data = { id: dataParam, account: "" };
            console.log("approve to wasabi");
            console.log(data);
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
          } else {
            var data = { id: dataParam, account: "" };
            console.log("approve not to wasabi");
            console.log(data);
            var jsonData = CRYPTO.encrypt(data);
            $http({
              method: "POST",
              url:
                webservicesUrl +
                "/changeStatusSuccessTransactionAccountByCompanyNotWasabi.php",
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

    $scope.getListAccount = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/getMyBank.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          //console.log(data);
          if (data.status.toLowerCase() == "ok") {
            $scope.acclist = data.records;
            if ($stateParams.data != null) {
              $scope.filter.accountno = $stateParams.data.accountno;
            }
            //$scope.changeMerchant();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };
    $scope.updateTrx = function (manualstatus, id, accountdest, memo = "") {
      //var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
      var data = {
        id: id,
        status: manualstatus,
        accountdest: accountdest,
        memo: memo,
      };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/updateManualTransaction.php",
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
        confirm(
          "Are you sure want to fail this transaction [" +
            data.futuretrxid +
            "]?"
        )
      ) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: "js/Modal/FailModalNew/FailModalNew.template.html?v=2",
          controller: "FailModalNewCtrl",
          size: "sm",
          scope: $scope,
          resolve: {
            items: function () {
              return { transactiontype: data.transactiontype };
            },
          },
        });
        modalInstance.result.then(
          function (returnValue) {
            $scope.updateTrx("C", data.futuretrxid, "", returnValue);
          },
          function () {
            console.log("Modal dismissed at: " + new Date());
          }
        );
      }
    };
    $scope.ManualSuccess = function (data) {
      $scope.updateTrx("S", data.futuretrxid, "");
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
        templateUrl: "templates/accountModal.html?v=1",
        controller: "selectAccountSourceModalCtrl",
        size: "sm",
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) {
          if (returnValue.length > 3) {
            var data = { id: dataParam, account: returnValue };
            console.log(data);
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

    $scope.Manual = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/accountModal.html?v=1",
        controller: "selectAccountModalCtrl",
        size: "sm",
        scope: $scope,
      });
      modalInstance.result.then(
        function (returnValue) {
          if (returnValue.length > 3) {
            if (returnValue != data.accountdst) {
              $scope.updateTrx("E", data.futuretrxid, returnValue);
            } else {
              alert(
                "Account source should be diffrent with account destination"
              );
            }
            //console.log("return value "+returnValue);
          }
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };
    $scope.getAccountBalance = function () {
      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var data = { datefrom: from, accountno: $scope.filter.accountno };
      var jsonData = CRYPTO.encrypt(data);
      $http({
        method: "POST",
        url: webservicesUrl + "/getAccountOpeningBalance.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          $scope.Balance = {};
          console.log(data.records);
          if (data.status.toLowerCase() == "ok") {
            $scope.Balance = data.records[0];
            $scope.Balance.opening = Number($scope.Balance.opening);
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.getListData = function () {
      dateFrom = $scope.convertJsDateToString($scope.filter.dateFrom);
      dateTo = $scope.convertJsDateToString($scope.filter.dateTo);
      var data = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        filter: $scope.filter.filter,
        agent: $scope.filter.agent ?? "", 
      };
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/new_deposit_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          //$scope.getAccountBalance();
          var data = response.data;
          console.log(data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            console.log(data.records);

            for (var i = 0, length = data.records.length; i < length; i++) {
              if (
                data.records[i]["transactiontype"] == "D" ||
                data.records[i]["transactiontype"] == "Topup" ||
                data.records[i]["transactiontype"] == "Y" ||
                data.records[i]["transactiontype"] == "I"
              ) {
                data.records[i]["DB"] = data.records[i]["amount"];
                data.records[i]["CR"] = "0";
              } else {
                data.records[i]["CR"] = data.records[i]["amount"];
                data.records[i]["DB"] = "0";
              }
              data.records[i]["fee"] = Number(data.records[i]["fee"]);
            }
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

    $scope.init = function () {
      //$scope.getListAccount();
      //$scope.getListData();
      $scope.getAgentList();
      var info = localStorage.getItem("bropay-login-info");
      if (info) {
        try {
          $scope.currentLoginInfo = JSON.parse(info);
        } catch (err) {}
      }
      //console.log($scope.currentLoginInfo);
    };
    $scope.init();
  },
]);

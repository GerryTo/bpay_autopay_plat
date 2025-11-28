app.controller("resubmitTransactionCtrl", [
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
        $scope.filter = {
            type: "6",
            amount: 1000,
        };
        $scope.filterUsed = {
            type: "0",
            amount: 1000,
        };
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
            enableSelectionBatchEvent: false,
            enableSorting: true,
            showColumnFooter: true,
            enableFiltering: true,
            enableGridMenu: true,
            enableColumnResizing: true,
            exporterExcelFilename: "resubmit-transaction.xlsx",
            exporterExcelSheetName: "Sheet1",
            rowTemplate: "templates/rowTemplate.html",
            columnDefs: [
                {
                    name: "Resubmit Time",
                    field: "resubmitTime",
                    width: 120,
                },
                {
                    name: "Timestamp",
                    field: "timestamp",
                    width: 120,
                    aggregationType: uiGridConstants.aggregationTypes.count,
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0,
                    },
                },
                { name: "Timestamp (BDT)", field: "timestampBdt", width: 120 },
                { name: "From", field: "from", width: 120 },
                { name: "Username", field: "username", width: 120 },
                // { name: "Alias", field: "alias", width: 120 },
                { name: "Phone Number", field: "phonenumber", width: 120 },
                { name: "Bank", field: "type", width: 120 },
                { name: "Merchant", field: "merchantCode", width: 120 },
                { name: "Trx ID", field: "securitycode", width: 120 },
                { name: "Customer Phone", field: "customerphone", width: 120 },
                {
                    name: "Trx Customer Phone",
                    field: "customerphoneTRX",
                    width: 120,
                },
                { name: "Service Center", field: "servicecenter", width: 120 },
                {
                    name: "Amount",
                    field: "amount",
                    type: "number",
                    cellClass: "grid-alignright",
                    cellFilter: "number: " + decimalDigit,
                    type: "number",
                    width: 120,
                },
                {
                    name: "Message",
                    field: "message",
                    cellTooltip: function (row, col) {
                        return row.entity.message;
                    },
                },
                {
                    name: "Transaction Type",
                    field: "transactiontype",
                    width: 120,
                },
                { name: "SMS ID", field: "smsid", width: 120 },
                {
                    name: "Future Trx ID",
                    field: "futuretrxid",
                    width: 120,
                    cellTemplate:
                        '<div style="padding:5px;">{{ row.entity.futuretrxid == -1 ? "Expired" : row.entity.futuretrxid }}</div>',
                },
                {
                    name: "Suspect Reason",
                    field: "suspectedreason",
                    width: 150,
                    cellTooltip: function (row, col) {
                        return row.entity.suspectedreason;
                    },
                },
                {
                    name: "Balance",
                    field: "balance",
                    type: "number",
                    cellClass: "grid-alignright",
                    cellFilter: "number: " + decimalDigit,
                    type: "number",
                    width: 120,
                },
                {
                    name: "Balance Calculate",
                    field: "balancecalculate",
                    type: "number",
                    cellClass: "grid-alignright",
                    cellFilter: "number: " + decimalDigit,
                    type: "number",
                    width: 120,
                },
                {
                    name: "Balance Different",
                    field: "balancediff",
                    type: "number",
                    cellClass: "grid-alignright",
                    cellFilter: "number: " + decimalDigit,
                    type: "number",
                    width: 120,
                },
                { name: "Match Manually", field: "matchmanually", width: 80 },
                { name: "Match Date", field: "matchdate", width: 100 },
                /*{
                name: 'Action', field: 'securitycode', width:150, 
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.futuretrxid == \'\'" ng-disabled="row.entity.disabled ==\'1\'" ng-click="grid.appScope.match(row.entity)">Match</button> <button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.futuretrxid == \'\'" ng-click="grid.appScope.expire(row.entity)">Expire</button>'
            },*/

                /*{
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="false" ng-click="grid.appScope.edit(row.entity)">'+$scope.globallang.proceed+'</button>' 
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>'
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.ibft(row.entity)" ng-show="row.entity.allowresend == \'1\' ">Resend</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.id)" ng-show="row.entity.status == \'Order need to check\'">Success</button>'
                    +' <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\' || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'">Receipt</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.TimeOut(row.entity.id)" ng-show="false">Order need to check</button>' , 
                    width:260
            }*/
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged(
                    $scope,
                    function (row) {
                        $scope.rowsSelected =
                            $scope.gridApi.selection.getSelectedRows();
                        $scope.countRows = $scope.rowsSelected.length;
                        if ($scope.countRows > 50) {
                            row.setSelected(false); // Remove selection for the current row
                        }
                    }
                );
            },
            data: [],
        };

        $scope.getListData = function () {
            $scope.gridIsLoading = true;

            $scope.filterUsed = $scope.filter;

            var jsonData = CRYPTO.encrypt($scope.filter);

            $http({
                method: "POST",
                url: webservicesUrl + "/resubmitTransaction_getList.php",
                data: { data: jsonData },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    // var data = CRYPTO.decrypt(response.data.data);
                    var data = response.data;
                    if (data.status.toLowerCase() == "ok") {
                        for (var i = 0; i < data.records.length; i++) {
                            data.records[i].message = decodeURIComponent(
                                data.records[i].message
                            );
                            data.records[i].from = decodeURIComponent(
                                data.records[i].from
                            );
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

        // $scope.expire = function (dataParam) {
        //   if (confirm("Are you sure want to expire this SMS?")) {
        //     var data = {
        //       amount: dataParam.amount,
        //       bank: dataParam.type,
        //       trxid: dataParam.securitycode,
        //       phonenumber: dataParam.customerphone,
        //     };

        //     var jsonData = CRYPTO.encrypt(data);
        //     $http({
        //       method: "POST",
        //       url: webservicesUrl + "/smsLog_expireSms.php",
        //       data: { data: jsonData },
        //       headers: {
        //         "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        //       },
        //     }).then(
        //       function mySuccess(response) {
        //         var data = CRYPTO.decrypt(response.data.data);
        //         if (data.status.toLowerCase() == "ok") {
        //           alert("Success!");
        //           $scope.getListData();
        //         } else {
        //           alert(data.message);
        //         }
        //       },
        //       function myError(response) {
        //         console.log(response);
        //       }
        //     );
        //   }
        // };

        // $scope.match = function (dataParam) {
        //   var modalInstance = $uibModal.open({
        //     animation: true,
        //     templateUrl:
        //       "js/Modal/TransactionSuggestionModal/TransactionSuggestionModal.template.html",
        //     controller: "TransactionSuggestionModalCtrl",
        //     size: "lg",
        //     scope: $scope,
        //     resolve: {
        //       items: function () {
        //         return {
        //           amount: dataParam.amount,
        //           bank: dataParam.type,
        //           trxid: dataParam.securitycode,
        //           phonenumber: dataParam.customerphone,
        //         };
        //       },
        //     },
        //   });

        //   modalInstance.result.then(
        //     function (returnValue) {
        //       var data = {
        //         futuretrxid: returnValue.futuretrxid,
        //         amount: dataParam.amount,
        //         bank: dataParam.type,
        //         trxid: dataParam.securitycode,
        //         phonenumber: dataParam.customerphone,
        //       };

        //       console.log(data);

        //       var jsonData = CRYPTO.encrypt(data);
        //       $http({
        //         method: "POST",
        //         url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
        //         data: { data: jsonData },
        //         headers: {
        //           "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        //         },
        //       }).then(
        //         function mySuccess(response) {
        //           var data = CRYPTO.decrypt(response.data.data);
        //           if (data.status.toLowerCase() == "ok") {
        //             alert("Success!");
        //             $scope.getListData();
        //           } else {
        //             alert(data.message);
        //           }
        //         },
        //         function myError(response) {
        //           console.log(response);
        //         }
        //       );
        //     },
        //     function () {
        //       console.log("Modal dismissed at: " + new Date());
        //     }
        //   );
        // };

        $scope.submit = function () {
            $tmp = $scope.filterUsed;
            $tmp.list = $scope.gridApi.selection.getSelectedRows();
            // alert("please dont use this function  for a while ...");
            // return;

            if ($tmp.list.length == 0) {
                alert("Please choose sms to submit");
                return false;
            }

            if (confirm("Submit " + $tmp.list.length + " SMS?")) {
                $scope.gridIsLoading = true;
                var jsonData = CRYPTO.encrypt($tmp);

                $http({
                    method: "POST",
                    url: webservicesUrl + "/resubmitTransaction_submit.php",
                    data: { data: jsonData },
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        $scope.gridIsLoading = false;
                        var data = CRYPTO.decrypt(response.data.data);

                        if (data.status.toLowerCase() == "ok") {
                            alert(
                                "Matching is in progress. Please refresh the list."
                            );
                            $scope.gridOptions.data = [];
                        } else {
                            alert(data.message);
                        }
                    },
                    function myError(response) {
                        $scope.gridIsLoading = false;
                        console.log(response.status);
                    }
                );
            }
        };

        $scope.refresh = function () {
            $scope.getListData();
        };

        $scope.init = function () {
            // $scope.getListData();
            // $scope.getPhoneUserList();
        };
        $scope.init();
    },
]);

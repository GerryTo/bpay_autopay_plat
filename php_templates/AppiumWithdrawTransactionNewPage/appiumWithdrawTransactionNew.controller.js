app.controller("appiumWithdrawTransactionNewCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "uiGridConstants",
    "$uibModal",
    "$interval",
    "$stateParams",
    function (
        $state,
        $scope,
        $http,
        $timeout,
        uiGridConstants,
        $uibModal,
        $interval,
        $stateParams
    ) {
        //----datepicker----

        $scope.datepickerConfig = {
            formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
            format: "dd-MMMM-yyyy",
            altInputFormats: ["M!/d!/yyyy"],
        };

        $scope.dateOptions = {
            //dateDisabled: disabled,
            formatYear: "yy",
            maxDate: new Date(new Date().setDate(new Date().getDate() + 1)),
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
            type: "2",
            user: "",
            status: $stateParams.filterStatus
                ? $stateParams.filterStatus
                : "AUTOMATION FAILED",
        };
        $scope.dataFilter = "";
        $scope.phoneUsers = [];
        //------------------
        $scope.getTransactionIdBgColor = function (entity) {
            if (!entity.insert || entity.completedate) return "";

            const now = new Date();
            const nowUtc = new Date(
                now.getTime() + now.getTimezoneOffset() * 60000
            );
            const nowGmt8 = new Date(
                nowUtc.getTime() + 8 * 60 * 60 * 1000
            ).getTime();
            const originalTime = new Date(entity.insert).getTime();
            const diff = nowGmt8 - originalTime;

            // if (diff < 180000) return 'lightgreen';
            if (diff >= 180000) return "red";

            return "";
        };

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
                    sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0,
                    },
                    aggregationType: uiGridConstants.aggregationTypes.count,
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "TransactionID",
                    field: "transactionid",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Duration Time",
                    field: "duration",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "System Timestamp",
                    field: "insert",
                    sort: { direction: "desc" },
                    width: 120,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Assign Timestamp",
                    field: "assignTime",
                    // sort: { direction: "desc" },
                    width: 120,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Original Timestamp",
                    field: "originaldate",
                    width: 120,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                    // visible: false,
                },
                {
                    name: "Complete Timestamp",
                    field: "completedate",
                    width: 120,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                // { name: "Client Timestamp", field: "timestamp", width: 120 },
                {
                    name: "MerchantID",
                    field: "merchantcode",
                    width: 120,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
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
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                //{ name: 'IP', field: 'ip' , width:150, hide:true},
                {
                    name: "Bank",
                    field: "bankcode",
                    sort: { direction: "asc" },
                    filter: { condition: uiGridConstants.filter.EXACT },
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Dest Account Name",
                    field: "dstbankaccount",
                    width: 150,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Dest Bank Account No",
                    field: "dstbankaccountNo",
                    width: 150,
                },
                // {
                //   name: "Source Bank Account",
                //   field: "accountno",
                //   width: 150,
                //   //   visible: false,
                // },
                {
                    name: "Source Account Name",
                    field: "sourceaccountname",
                    width: 150,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                    //   visible: false,
                },
                {
                    name: "Notes 3",
                    field: "notes3",
                    width: 150,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                    //   visible: false,
                },
                {
                    name: "Status Automation",
                    field: "statusAutomation",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Status Transaction",
                    field: "statusTransaction",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Memo",
                    field: "memo",
                    width: 180,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                // { name: "Resend Attempt", field: "resendAttempt", width: 100 },
                {
                    name: "Sent Mqtt",
                    field: "SentMqtt",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Receive Mqtt",
                    field: "ReceiveMqtt",
                    width: 100,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "isWithdrawUpload",
                    field: "isWithdrawUpload",
                    width: 100,
                    visible: true,
                    cellTemplate: `
          <div class="ui-grid-cell-contents" 
              ng-style="{ 'background-color': grid.appScope.getTransactionIdBgColor(row.entity) }">
            {{ COL_FIELD }}
          </div>
        `,
                },
                {
                    name: "Action",
                    field: "resendAttempt",
                    justify: "center",
                    cellTemplate:
                        '<button type="button" class="btn btn-primary btn-sm" ' +
                        'ng-show="grid.appScope.isFinishCheckinghistory()" ' +
                        'ng-click="grid.appScope.resend(row.entity)">Resend</button>' +
                        " " +
                        '<button type="button" class="btn btn-danger btn-sm" ' +
                        "ng-show=\"grid.appScope.isWithdrawAttendion() && (grid.appScope.successAndFailed() || grid.appScope.isFinishCheckinghistory()) && row.entity.isWithdrawUpload ==  '0'\" " +
                        'ng-click="grid.appScope.reassign(row.entity) ">Reassign</button>' +
                        "  " +
                        '<button type="button" class="btn btn-secondary btn-sm" ' +
                        "ng-show=\"grid.appScope.isWithdrawAttendion() && grid.appScope.successAndFailed() && !grid.appScope.isFinishCheckinghistory() &&(row.entity.isWithdrawUpload ==  '0' || row.entity.isWithdrawUpload ==  '2')\"  " +
                        'ng-click="grid.appScope.manualReassign(row.entity) ">Manual Reassign</button>' +
                        "  " +
                        '<button type="button" class="btn btn-info btn-sm" ' +
                        "ng-show=\"row.entity.isWithdrawUpload ==  '1' || row.entity.isWithdrawUpload ==  '3' \" " +
                        'ng-click="grid.appScope.assignForUpload(row.entity) ">Reassign Upload Withdraw</button>' +
                        "  " +
                        '<button type="button" class="btn btn-warning btn-sm" ' +
                        'ng-show="grid.appScope.isWithdrawAttendion() && grid.appScope.successAndFailed()" ' +
                        'ng-click="grid.appScope.cancel(row.entity)">Fail</button>' +
                        "  " +
                        '<button type="button" class="btn btn-success btn-sm" ' +
                        'ng-show="grid.appScope.isWithdrawAttendion() && grid.appScope.successAndFailed()" ' +
                        'ng-click="grid.appScope.success(row.entity)">Success</button>' +
                        "  " +
                        '<button type="button" class="btn btn-danger btn-sm" ' +
                        'ng-show="grid.appScope.isPending() && grid.appScope.successAndFailed()" ' +
                        'ng-click="grid.appScope.cancelAutomation(row.entity)">Cancel</button>' +
                        "  " +
                        '<button type="button" class="btn btn-danger btn-sm" ' +
                        'ng-show="grid.appScope.successAndFailed()" ' +
                        'ng-click="grid.appScope.setToAutoAssign(row.entity)">Send To Auto Assign</button>',
                    width: 300,
                },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            data: [],
        };

        $scope.isPending = function () {
            return (
                $scope.dataFilter === "SEND TO AUTOMATION SUCCESS" ||
                $scope.dataFilter === "assign" ||
                $scope.dataFilter === "reassign" ||
                $scope.dataFilter === "pending"
            );
        };

        $scope.isWithdrawAttendion = function () {
            return (
                $scope.dataFilter === "AUTOMATION FAILED 2" ||
                $scope.dataFilter === "finished_checking_history" ||
                $scope.dataFilter === "AUTOMATION FAILED"
            );
        };

        $scope.isFinishCheckinghistory = function () {
            return $scope.dataFilter === "finished_checking_history";
        };

        $scope.setToAutoAssign = function (dataParam) {
            console.log(dataParam);
            if (
                confirm(
                    "Are you sure want to send this transaction to auto assign [" +
                        dataParam.id +
                        "]?"
                )
            ) {
                var params = {
                    id: dataParam.id,
                };
                $http({
                    method: "POST",
                    url: webservicesUrl + "/appiumWithdrawSendToAutoAssign.php",
                    data: { data: params },
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        var data = response.data.data;
                        if (data.status.toLowerCase() == "ok") {
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
            }
        };

        $scope.successAndFailed = function () {
            var item = true;
            if (
                $scope.dataFilter === "Withdrawal Failed" ||
                $scope.dataFilter === "Withdrawal Success"
            ) {
                item = false;
            }
            return item;
        };

        $scope.getAgentList = function () {
            $http({
                method: "POST",
                url: webservicesUrl + "/getMasterMyBankNew.php",
                data: { data: "" },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    console.log("Response from server:", response);
                    var data = CRYPTO.decrypt(response.data.data);
                    console.log("Decrypted data:", data);

                    if (data.status.toLowerCase() == "ok") {
                        let unique = {};
                        let deduplicated = [];

                        data.records.forEach(function (item) {
                            if (!unique[item.bankAccNo]) {
                                unique[item.bankAccNo] = true;
                                deduplicated.push(item);
                            }
                        });

                        $scope.agentList = deduplicated;

                        if (deduplicated.length > 0) {
                            $scope.filter.account = deduplicated[0].account;
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

        $scope.getListData = function () {
            $scope.gridIsLoading = true;
            console.log($scope.filter.hour);
            var from =
                $scope.convertJsDateToString($scope.filter.fromdate) +
                " 00:00:00";
            var to =
                $scope.convertJsDateToString($scope.filter.todate) +
                " 23:59:59";

            var data = {
                datefrom: from,
                dateto: to,
                status: $scope.filter.status ?? "Withdrawal Success",
                agent: $scope.filter.agent ?? "",
            };
            var jsonData = data;

            $http({
                method: "POST",
                url: webservicesUrl + "/appiumWithdrawTransactionNew2.php",
                data: { data: jsonData },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = response.data;
                    $scope.dataFilter = data.filter;
                    if (data.status.toLowerCase() == "ok") {
                        console.log(data.records);
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

        $scope.resend = function (dataParam) {
            $scope.gridIsLoading = true;
            var data = {
                queueId: dataParam.queue,
            };

            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/withdrawQueue_resend.php",
                data: { data: jsonData },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = CRYPTO.decrypt(response.data.data);
                    if (data.status == "ok") {
                        alert("Success send to automation");
                        $scope.getListData();
                    } else {
                        alert(data.message);
                        $scope.getListData();
                    }
                },
                function myError(response) {
                    $scope.gridIsLoading = false;
                    console.log(response.status);
                }
            );
        };

        $scope.cancel = function (data) {
            if (
                confirm(
                    "Are you sure want to fail this transaction [" +
                        data.id +
                        "]?"
                )
            ) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl:
                        "js/Modal/FailModalNew/FailModalNew.template.html?v=2",
                    controller: "FailModalNewCtrl",
                    size: "sm",
                    scope: $scope,
                    resolve: {
                        items: function () {
                            return { transactiontype: "W" };
                        },
                    },
                });
                modalInstance.result.then(
                    function (returnValue) {
                        $scope.updateTrx("C", data.id, "", returnValue);
                    },
                    function () {
                        console.log("Modal dismissed at: " + new Date());
                    }
                );
            }
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
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
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

        $scope.success = function (dataParams) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "templates/successModal.html?v=" + new Date().getTime(),
                controller: "successModalCtrl",
                size: "md",
                scope: $scope,
            });

            modalInstance.result.then(
                function (returnValue) {
                    var data = {
                        id: dataParams.id,
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
                },
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        };

        $scope.manualReassign = function (data) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/WithdrawAssignManualModal/withdrawAssignManual.template.html",
                controller: "withdrawAssignManualModalCtrl",
                scope: $scope,
                resolve: {
                    params: function () {
                        return { bankcode: data.bankcode, amount: data.amount };
                    },
                },
            });
            modalInstance.result.then(
                function (returnValue) {
                    var params = {
                        id: data.id,
                        accountNo: returnValue.accountNo,
                        bankCode: returnValue.bankCode,
                        accountName: returnValue.accountName,
                        username: returnValue.username,
                        queueId: data.queue,
                        assign: data.assignTime,
                    };
                    console.log(params);
                    var jsonData = CRYPTO.encrypt(params);
                    $http({
                        method: "POST",
                        url:
                            webservicesUrl +
                            "/withdrawAssignmentManual_assign.php",
                        data: { data: jsonData },
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8",
                        },
                    }).then(
                        function mySuccess(response) {
                            var data = CRYPTO.decrypt(response.data.data);
                            if (data.status.toLowerCase() == "ok") {
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
                    //console.log('Modal dismissed at: ' + new Date());
                }
            );
        };

        $scope.assignForUpload = function (data) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/WithdrawAssignModal/WithdrawAssignModal.template.html",
                controller: "withdrawAssignModalCtrl",
                scope: $scope,
                resolve: {
                    params: function () {
                        return { bankcode: data.bankcode };
                    },
                },
            });
            modalInstance.result.then(
                function (returnValue) {
                    var params = {
                        id: data.id,
                        accountNo: returnValue.accountNo,
                        bankCode: returnValue.bankCode,
                        accountName: returnValue.accountName,
                        username: returnValue.username,
                    };
                    var jsonData = CRYPTO.encrypt(params);
                    $http({
                        method: "POST",
                        url:
                            webservicesUrl +
                            "/withdrawAssignmentForUpload_assign.php",
                        data: { data: jsonData },
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8",
                        },
                    }).then(
                        function mySuccess(response) {
                            var data = CRYPTO.decrypt(response.data.data);
                            if (data.status.toLowerCase() == "ok") {
                                alert("Assignment Success!");
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
                    //console.log('Modal dismissed at: ' + new Date());
                }
            );
        };

        $scope.reassign = function (data) {
            $scope.gridIsLoading = true;
            var jsonData = {
                queueId: data.queue,
                assign: data.assignTime,
                isAutoReassign: 0,
            };
            $http({
                method: "POST",
                url: webservicesUrl + "/appiumWithdrawTransaction_Reassign.php",
                data: { data: jsonData },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    var data = response.data;
                    alert(data.messages);
                    if (data.status === "ok") {
                        $scope.getListData();
                        $scope.gridIsLoading = false;
                    } else {
                        $scope.gridIsLoading = false;
                        console.log(data.messages);
                    }
                },
                function myError(response) {
                    $scope.gridIsLoading = false;
                    console.log(response.data.messages);
                }
            );
        };

        $scope.cancelAutomation = function (data) {
            $scope.gridIsLoading = true;
            if (
                confirm(
                    "Are you sure want to Cancel automationt transaction [" +
                        data.id +
                        "]?"
                )
            ) {
                var dataParams = {
                    queueId: data.queue,
                };
                $http({
                    method: "post",
                    url: webservicesUrl + "/appiumWithdrawCancelAutomation.php",
                    data: { data: dataParams },
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        var data = response.data;
                        if (data.status === "ok") {
                            alert("Success cancel automation");
                            $scope.getListData();
                            $scope.gridIsLoading = false;
                        } else {
                            alert(data.message);
                            $scope.gridIsLoading = false;
                        }
                    },
                    function myError(response) {
                        $scope.gridIsLoading = false;
                        console.log(response.status);
                    }
                );
            } else {
                $scope.gridIsLoading = false;
            }
        };

        $scope.refresh = function () {
            $scope.getListData();
        };

        $scope.init = function () {
            // $scope.getListData();
            $scope.getAgentList();
        };
        $scope.init();
    },
]);

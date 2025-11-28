app.controller("transactionByIdNewCtrl", [
    "$state", "$scope", "$http", "$timeout", "$stateParams", "$uibModal", "uiGridConstants", 
    function ($state, $scope, $http, $timeout, $stateParams, $uibModal, uiGridConstants) {
        $scope.filter = {
            transId: "",
            history: false,
            archive: false
        }

        $scope.config = {
            date: {
                picker: {
                    formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
                    format: "dd-MMMM-yyyy",
                    altInputFormats: ["M!/d!/yyyy"],
                },
                options: {
                    //dateDisabled: disabled,
                    formatYear: "yy",
                    maxDate: new Date(),
                    //minDate: new Date(),
                    startingDay: 1,
                }
            },
            grid: {
                enableSorting: true,
                showColumnFooter: true,
                enableFiltering: true,
                enableGridMenu: true,
                enableColumnResizing: true,
                exporterExcelFilename: "transaction-by-id-new.xlsx",
                exporterExcelSheetName: "Sheet1",
                rowTemplate: "templates/rowTemplate.html",
                columnDefs: [
                    {
                        name: "Future Trx ID",
                        field: "futuretrxid",
                        aggregationType: uiGridConstants.aggregationTypes.count,
                        footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
                        sort: {
                            direction: uiGridConstants.DESC,
                            priority: 0,
                        },
                        width: "25%"
                    },
                    { name: "Customer Code", field: "customercode", width: "25%" },
                    { name: "Status", field: "status", width: "25%" },
                    { name: "Trans ID", field: "transactionid", width: "25%" },
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                },
                data: [],
            }
        }

        $scope.event = {
            refresh: () => {
                $scope.getListData();
            },
            boxClick: (x) => {
                switch (x) {
                    case 1:
                        if ($scope.filter.archive == true) $scope.filter.archive = false;
                        break;
                    case 2:
                        if ($scope.filter.history == true) $scope.filter.history = false;
                        break;
                    default:
                        return false;
                }
            }
        }

        $scope.effect = {
            loading: false
        }

        $scope.info = {
            currentLogin: {},
            accList: [],
        }

        $scope.Balance = {};
        $scope.Summary = {
            pendingDB: 0,
            pendingCR: 0,
            DB: 0,
            CR: 0,
            fee: 0,
        };

        $scope.ResendCallback = function (dataParam) {
            var params = { futuretrxid: dataParam.futuretrxid };
            console.log(params);
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
        }
        
        $scope.edit = function (data) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "js/Modal/TransactionEditModal/TransactionEditModal.template.html?v=2",
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

        /*SUCCESS DEPOSI*/
        $scope.SuccessDeposit = function (dataParam) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "templates/successDepositManualModal.html?v=1",
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
                    var data = { id: dataParam, transid: returnValue.transid };
                    var jsonData = CRYPTO.encrypt(data);
                    $http({
                        method: "POST",
                        url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompany.php",
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
        }

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
        }

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
                            url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompany.php",
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
                    } else {
                        var data = { id: dataParam, account: "" };
                        console.log("approve not to wasabi");
                        console.log(data);
                        var jsonData = CRYPTO.encrypt(data);
                        $http({
                            method: "POST",
                            url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompanyNotWasabi.php",
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
                    }
                },
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        }
        
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
                        $scope.info.acclist = data.records;
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
        }
        
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
        }
        
        $scope.receipt = function (data) {
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
                function (returnValue) {},
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        }
        
        $scope.cancel = function (data) {
            if (confirm("Are you sure want to fail this transaction [" + data.futuretrxid + "]?")) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: "templates/failModal.html?v=2",
                    controller: "failModalCtrl",
                    size: "sm",
                    scope: $scope,
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
        }
        
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
                        url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompany.php",
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
        }
        
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
                            url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompany.php",
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
                    }
                },
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        }
        
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
                            alert("Account source should be diffrent with account destination");
                        }
                      //console.log("return value "+returnValue);
                    }
                },
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        }
        
        $scope.getAccountBalance = function () {
            var from = $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
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
            if ($scope.filter.transId == "") {
                alert("Please Input Transaction Id");
                return false;
            }
            $scope.effect.loading = true;
            
            this.history = $scope.filter.history;
            this.archive = $scope.filter.archive;
            var data = {
                transId: $scope.filter.transId,
                type: this.history == true ? 'history' : this.archive == true ? 'archive' : "current"
            }

            $http({
                method: "POST",
                url: `${webservicesUrl}/transactionByIdNew_getList.php`,
                data: {
                    data: CRYPTO.encrypt(data)
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(res) {
                    $scope.effect.loading = false;
                    var data = CRYPTO.decrypt(res.data.data);
                    // console.log(data);
                    if (data.status.toLowerCase() == "ok") {
                        data.records = $scope.urlDecode(data.records);
                        for (let i = 0; i < data.records.length; i++) {
                            let transtype = data.records[i].transactiontype;
                            if (transtype == "D" || transtype == "Topup" || transtype == "Y" || transtype == "I") {
                                data.records[i].DB = data.records[i].amount;
                                data.records[i].CR = 0;
                            } else {
                                data.records[i].CR = data.records[i].amount;
                                data.records[i].DB = 0;
                            }
                            data.records[i].fee = Number(data.records[i].fee);
                        }
                        $scope.config.grid.data = data.records;
                    } else {
                        alert(data.message);
                    }
                },
                function myError(err) {
                    $scope.effect.loading = false;
                    console.log(err.status);
                }
            );
        }

        $scope.init = function () {
            var info = localStorage.getItem("bropay-login-info");
            if (info) {
                try {
                    $scope.info.currentLogin = JSON.parse(info);
                } catch (err) {}
            }
        }
        $scope.init();
    }
]);
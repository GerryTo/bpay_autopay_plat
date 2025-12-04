app.controller("availableAccountNewWdCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "uiGridConstants",
    "$stateParams",
    "$uibModal",
    "$interval",
    "$rootScope",
    function (
        $state,
        $scope,
        $http,
        $timeout,
        uiGridConstants,
        $stateParams,
        $uibModal,
        $interval,
        $rootScope
    ) {
        $scope.gridIsLoading = false;
        $scope.filter = {
            group: "1",
        };

        $scope.gridOptions = {
            enableSorting: true,
            showColumnFooter: true,
            enableFiltering: true,
            enableGridMenu: true,
            enableColumnResizing: true,
            rowTemplate: "templates/rowTemplate.html",
            columnDefs: [
                { name: "Bank Code", field: "v_bankcode", width: 150 },
                { name: "Account No", field: "v_bankaccountno", width: 150 },
                { name: "Active", field: "v_isactive", width: 150 },
                { name: "Type", field: "v_type", width: 100 },
                { name: "Group", field: "n_groupid", width: 100 },
                { name: "Merchant Code", field: "v_merchantcode", width: 100 },
                { name: "User", field: "v_user", width: 100 },
                { name: "Use Credit", field: "n_isusecredit", width: 100 },
                { name: "Last Balance", field: "n_lastBalance", width: 100,cellFilter: "number: " + decimalDigit, cellClass: "grid-alignright", type: "number", },
                // {
                //   name: "Credit",
                //   field: "n_credit",
                //   width: 100,
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                // },
                // {
                //   name: "Running Credit",
                //   field: "n_running_credit",
                //   width: 100,
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                // },
                {
                    name: "Action",
                    field: "id",
                    width: 300,
                    cellTemplate:
                        '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)">Edit</button>',
                },
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

        $scope.rerun = function () {
            if (
                confirm(
                    "Are ypou sure want to re-run available account new wd?"
                )
            ) {
                $scope.gridIsLoading = true;

                $http({
                    method: "POST",
                    url: webservicesUrl + "/availableAccountNewWd_rerun.php",
                    data: {},
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        $scope.gridIsLoading = false;

                        if (data.status.toLowerCase() == "ok") {
                            alert("Re-run Success!");
                            $scope.getListData();
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

        $scope.submit = function () {
            $tmp = {};
            $tmp = $scope.filter;
            $tmp.list = $scope.gridApi.selection.getSelectedRows();
            console.log($tmp);
            if ($tmp.list.length == 0) {
                alert("Please choose mybank to update!");
                return false;
            }

            if (confirm("Update " + $tmp.list.length + " MyBank?")) {
                $scope.gridIsLoading = true;
                var jsonData = CRYPTO.encrypt($tmp);

                $http({
                    method: "POST",
                    url:
                        webservicesUrl +
                        "/updateAvailableAccountSelectedWd.php",
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
                            alert("Update Success!");
                            $scope.getListData();
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

        $scope.getListData = function () {
            var data = {};

            $scope.gridIsLoading = true;
            $http({
                method: "POST",
                url: webservicesUrl + "/availableAccountNewWd.php",
                data: data,
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = response.data;

                    console.log(data.records);

                    if (data.status.toLowerCase() == "success") {
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

        $scope.updatePriority = function () {
            $tmp = {};
            let selectedRows = $scope.gridApi.selection.getSelectedRows();
            console.log(selectedRows);
            let seenUsers = new Set();
            let uniqueRows = selectedRows.filter((row) => {
                if (seenUsers.has(row.v_user)) {
                    return false;
                } else {
                    seenUsers.add(row.v_user);
                    return true;
                }
            });
            $tmp.list = uniqueRows;
            $tmp.group = 5;
            if ($tmp.list.length == 0) {
                alert("Please choose agent to update!");
                return false;
            }
            var jsonData = CRYPTO.encrypt($tmp);
            if (confirm("Update " + $tmp.list.length + " Agent?")) {
                $scope.gridIsLoading = true;
                $http({
                    method: "POST",
                    data: { data: jsonData },
                    url:
                        webservicesUrl +
                        "/updateAvailableAccountSelectedWd.php",
                    headers: {
                        "content-Type":
                            "application/x-www-form-urlencoded;charset-UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        $scope.gridIsLoading = false;
                        var data = CRYPTO.decrypt(response.data.data);
                        if (data.status.toLowerCase() == "ok") {
                            alert("The agent succes to update");
                            $scope.getListData();
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

        $scope.edit = function (dataParam) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/AvailableAccountNewModal/availableAccountNewModal.template.html?v=" +
                    new Date().getTime(),
                controller: "availableAccountNewModalCtrl",
                size: "lg",
                scope: $scope,
                resolve: {
                    params: function () {
                        return { group: dataParam.n_groupid };
                    },
                },
            });
            modalInstance.result.then(
                function (returnValue) {
                    //   console.log(returnValue);
                    var data = {
                        groupid: returnValue.groupSelected,
                        bankCode: dataParam.v_bankcode,
                        merchant: dataParam.v_merchantcode,
                        user: dataParam.v_user,
                    };
                    $http({
                        method: "POST",
                        url:
                            webservicesUrl +
                            "/updateGroupAvailableAccountNewWd.php",
                        data: data,
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8",
                        },
                    }).then(
                        function mySuccess(response) {
                            var data = response.data;
                            if (data.status.toLowerCase() == "ok") {
                                alert("Update Success!");
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

        $scope.refresh = function () {
            $scope.getListData();
        };

        $scope.init = function () {
            $scope.getListData();
        };
        $scope.init();
    },
]);

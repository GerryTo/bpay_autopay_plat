app.controller("merchantBankAccListCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "uiGridConstants",
    function ($state, $scope, $http, $timeout, uiGridConstants) {
        $scope.filter = {
            fromdate: new Date(),
            todate: new Date(),
            merchantCode: "ALL",
            isdeleted: 0,
            update: "linked",
        };

        $scope.merchantList = [];

        $scope.gridIsLoading = false;

        $scope.updateList = ["linked", "notLinked"];
        $scope.getHeight = function () {
            return window.innerHeight - 180;
        };

        $scope.gridOptions = {
            showGridFooter: true,
            enableSorting: true,
            showColumnFooter: true,
            enableColumnResizing: true,
            enableGridMenu: true,
            exporterExcelFilename: "merchant-bank-acc.xlsx",
            exporterPdfMaxGridWidth: 500,
            enableFiltering: true,
            rowTemplate: "templates/rowTemplate.html",
            columnDefs: [
                { name: "Merchant Code", field: "v_merchantcode", width: 150 },
                { name: "Account No", field: "v_bankaccountno", width: 120 },
                {
                    name: "Account Name",
                    field: "v_bankaccountname",
                    width: 180,
                },
                {
                    name: "is linked",
                    field: "n_isdeleted",
                    cellTemplate:
                        '<div class="ui-grid-cell-contents">{{ COL_FIELD == 1 ? "No" : "Yes" }}</div>',
                    width: 120,
                },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            data: [],
        };

        $scope.getMerchantList = function () {
            $http({
                method: "POST",
                url: webservicesUrl + "/masterMerchant_getList.php",
                data: { data: "" },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    var data = CRYPTO.decrypt(response.data.data);
                    if (data.status.toLowerCase() == "ok") {
                        $scope.merchantList = data.records;
                        if (data.records.length > 0) {
                            $scope.filter.merchantCode =
                                data.records[0].merchantcode;
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
            var data = {
                merchant: $scope.filter.merchantCode,
                isdeleted:
                    $scope.filter.isdeleted == "" ? 0 : $scope.filter.isdeleted,
            };
            var jsonData = data;

            $scope.gridIsLoading = true;

            $http({
                method: "POST",
                url: webservicesUrl + "/getMerchantBankAccList.php",
                data: { data: jsonData },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
                timeout: 2 * 60 * 1000,
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    console.log(response.data);
                    var data = response.data;
                    if (data.status.toLowerCase() == "ok") {
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

        $scope.submit = function () {
            var arr = $scope.gridApi.selection.getSelectedRows();
            if (arr.length > 0) {
                if (
                    confirm(
                        `Are you sure you want to set ${$scope.filter.update} selected items?`
                    )
                ) {
                    var obj = {
                        setUpdate: $scope.filter.update,
                        items: arr,
                    };
                    console.log(obj);
                    $http({
                        method: "POST",
                        url: webservicesUrl + "/updateMerchantBankSelected.php",
                        data: { data: obj },
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8",
                        },
                    }).then(
                        function mySuccess(response) {
                            var data = response.data;
                            if (data.status.toLowerCase() === "ok") {
                                $scope.getListData();
                            } else {
                                alert(data.message);
                            }
                        },
                        function myError(response) {
                            console.log(response.data.message);
                        }
                    );
                }
            }
        };

        $scope.refresh = function () {
            $scope.getListData();
        };
        $scope.init = function () {
            $scope.getMerchantList();
        };
        $scope.init();
    },
]);

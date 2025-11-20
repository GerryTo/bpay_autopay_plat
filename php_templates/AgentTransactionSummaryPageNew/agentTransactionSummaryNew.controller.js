app.controller("agentTransactionSummaryNewCtrl", [
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
        $scope.datepickerConfig = {
            formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
            format: "dd-MMMM-yyyy",
            altInputFormats: ["M!/d!/yyyy"],
        };
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        $scope.dateOptions = {
            //dateDisabled: disabled,
            formatYear: "yy",
            maxDate: yesterday,
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
            fromdate: yesterday,
            todate: yesterday,
            accountno: "0",
            includeZero: false,
        };

        $scope.gridIsLoading = false;

        $scope.gridOptions = {
            enableSorting: true,
            showColumnFooter: true,
            enableFiltering: true,
            enableGridMenu: true,
            enableColumnResizing: true,
            rowTemplate: "templates/rowTemplate.html",
            columnDefs: [
                { name: "Date", field: "date", width: 150 },
                // { name: "Master Agent", field: "agentMaster", width: 150 },
                { name: "Agent Username", field: "agentUsername", width: 150 },
                // {
                //   name: "Total Credit",
                //   field: "totalCredit",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Holding Credit",
                //   field: "holdingCredit",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                {
                    name: "Available Credit",
                    field: "availableCredit",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                {
                    name: "NAGAD Credit",
                    field: "nagad",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents grid-alignright"><a href="" ng-click="grid.appScope.nagadClick(row.entity.agentUsername, row.entity.nagad )">{{COL_FIELD | number:decimalDigit}}</a></div>',
                },
                {
                    name: "BKASH Credit",
                    field: "bkash",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents grid-alignright"><a href="" ng-click="grid.appScope.bkashClick(row.entity.agentUsername, row.entity.bkash)">{{COL_FIELD | number:decimalDigit}}</a></div>',
                },
                // {
                //   name: "ROCKET Credit",
                //   field: "rocket",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Cash Out Count",
                //   field: "cashOutCount",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                {
                    name: "Cash Out Amount",
                    field: "cashOutAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                // {
                //   name: "Cash In Count",
                //   field: "cashInCount",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                {
                    name: "Cash In Amount",
                    field: "cashInAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                // {
                //   name: "Cash Out Comm.",
                //   field: "cashOutComm",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Cash In Comm.",
                //   field: "cashInComm",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Pending Comm.",
                //   field: "pendingComm",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Available Comm.",
                //   field: "availableComm",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   // aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                {
                    name: "Nagad Cash Out Amount",
                    field: "nagadCashOutAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                {
                    name: "Nagad Cash In Amount",
                    field: "nagadCashInAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                {
                    name: "Bkash Cash Out Amount",
                    field: "bkashCashOutAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                {
                    name: "Bkash Cash In Amount",
                    field: "bkashCashInAmount",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                },
                // {
                //   name: "Rocket Cash Out Amount",
                //   field: "rocketCashOutAmount",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //   name: "Rocket Cash In Amount",
                //   field: "rocketCashInAmount",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                {
                    name: "Credit Adjusment In",
                    field: "creditAdjustmentIn",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents grid-alignright"><a href="" ng-click="grid.appScope.adjcashin(row.entity.agentUsername,row.entity.date )">{{COL_FIELD | number:decimalDigit}}</a></div>',
                },
                {
                    name: "Credit Adjustment Out",
                    field: "creditAdjustmentOut",
                    cellFilter: "number: " + decimalDigit,
                    cellClass: "grid-alignright",
                    type: "number",
                    width: 150,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    footerCellTemplate:
                        '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                    cellTemplate:
                        '<div class="ui-grid-cell-contents grid-alignright"><a href="" ng-click="grid.appScope.adjcashout(row.entity.agentUsername,row.entity.date )">{{COL_FIELD | number:decimalDigit}}</a></div>',
                },
                // {
                //   name: "Credit Topup",
                //   field: "creditTopUp",
                //   cellFilter: "number: " + decimalDigit,
                //   cellClass: "grid-alignright",
                //   type: "number",
                //   width: 150,
                //   aggregationType: uiGridConstants.aggregationTypes.sum,
                //   footerCellTemplate:
                //     '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:decimalDigit }}</div>',
                // },
                // {
                //     name: 'Action', field: 'id', width:300,
                //     cellTemplate: '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'in\')"  >Adjust In</button>'
                //         + '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'out\')"  >Adjust Out</button>'
                // }
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            data: [],
        };

        $scope.nagadClick = function (agent, endingCredit) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/CurrentCreditSummaryDetailModal/CurrentCreditSummaryDetailModal.template.html?v=" +
                    new Date().getTime(),
                controller: "CurrentCreditSummaryDetailModalCtrl",
                size: "lg",
                scope: $scope,
                resolve: {
                    items: function () {
                        return {
                            bankcode: "NAGAD",
                            user: agent,
                            endingCredit: endingCredit,
                        };
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

        $scope.bkashClick = function (agent, endingCredit) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/CurrentCreditSummaryDetailModal/CurrentCreditSummaryDetailModal.template.html?v=" +
                    new Date().getTime(),
                controller: "CurrentCreditSummaryDetailModalCtrl",
                size: "lg",
                scope: $scope,
                resolve: {
                    items: function () {
                        return {
                            bankcode: "BKASH",
                            user: agent,
                            endingCredit: endingCredit,
                        };
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

        $scope.adjcashin = function (agent, date) {
            console.log(agent);
            var from = $scope.convertJsDateToString($scope.filter.fromdate);
            var to = $scope.convertJsDateToString($scope.filter.todate);
            console.log(from);
            console.log(to);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/AdjustmentTransactionDetailModal/AdjustmentTransactionDetailModal.template.html?v=" +
                    new Date().getTime(),
                controller: "AdjustmentTransactionDetailModalCtrl",
                size: "lg",
                scope: $scope,
                resolve: {
                    items: function () {
                        return {
                            user: agent,
                            from: date,
                            to: to,
                            type: "IN",
                        };
                    },
                },
            });

            modalInstance.result.then(
                function (returnValue) {},
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        };

        $scope.adjcashout = function (agent, date) {
            console.log(agent);
            var from = $scope.convertJsDateToString($scope.filter.fromdate);
            var to = $scope.convertJsDateToString($scope.filter.todate);
            console.log(from);
            console.log(to);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl:
                    "js/Modal/AdjustmentTransactionDetailModal/AdjustmentTransactionDetailModal.template.html?v=" +
                    new Date().getTime(),
                controller: "AdjustmentTransactionDetailModalCtrl",
                size: "lg",
                scope: $scope,
                resolve: {
                    items: function () {
                        return {
                            user: agent,
                            from: date,
                            to: to,
                            type: "OUT",
                        };
                    },
                },
            });

            modalInstance.result.then(
                function (returnValue) {},
                function () {
                    console.log("Modal dismissed at: " + new Date());
                }
            );
        };
        $scope.getListData = function () {
            var from =
                $scope.convertJsDateToString($scope.filter.fromdate) +
                " 00:00:00";
            var to =
                $scope.convertJsDateToString($scope.filter.todate) +
                " 23:59:59";

            var data = {
                from: from,
                to: to,
                includeZero: $scope.filter.includeZero,
            };

            $scope.gridIsLoading = true;
            $http({
                method: "POST",
                url: webservicesUrl + "/agentTransactionSummary_getList_new.php",
                data: data,
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    // var data = CRYPTO.decrypt(response.data.data);
                    var data = response.data;

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

        $scope.refresh = function () {
            $scope.getListData();
        };

        $scope.getHeight = function () {
            return window.innerHeight - 280;
        };

        $scope.init = function () {
            // $scope.getListAccount();
            $scope.getListData();
        };
        $scope.init();
    },
]);

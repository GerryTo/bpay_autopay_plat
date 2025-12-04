app.controller("reportDifferenceCtrl", [
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
        $scope.datepickerConfig = {
            formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
            format: "dd-MMMM-yyyy",
            altInputFormats: ["M!/d!/yyyy"],
        };

        $scope.dateOptions = {
            formatYear: "yy",
            maxDate: new Date(),
            startingDay: 1,
        };
        
        $scope.popup1 = {
            opened: false,
        };
        
        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.filter = {
            date: new Date(),
        };

        $scope.gridIsLoading = false;

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
            exporterExcelFilename: "report-difference.xlsx",
            exporterExcelSheetName: "Sheet1",
            rowTemplate: "templates/rowTemplate.html",
            columnDefs: [
                {
                    name: "Username",
                    field: "v_username",
                    width: 130,
                    aggregationType: uiGridConstants.aggregationTypes.count,
                },
                {
                    name: "Main User",
                    field: "v_mainuser",
                    width: 130,
                },
                {
                    name: "Bank",
                    field: "v_bankcode",
                    width: 120,
                },
                // {
                //     name: "Cash In",
                //     field: "n_cashIn",
                //     width: 120,
                //     type: 'number',
                //     aggregationType: uiGridConstants.aggregationTypes.sum,
                //     cellFilter: 'number:0',
                //     footerCellFilter: 'number:0',
                // },
                // {
                //     name: "CI Transactions",
                //     field: "n_ciTransactions",
                //     width: 120,
                //     type: 'number',
                //     aggregationType: uiGridConstants.aggregationTypes.sum,
                //     cellFilter: 'number:0',
                //     footerCellFilter: 'number:0',
                // },
                {
                    name: "Cash In Summary",
                    field: "n_cashIn_diff",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'currency:"":0',
                    footerCellFilter: 'currency:"":0',
                    cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (grid.getCellValue(row, col) < 0) {
                            return 'text-danger';
                        } else if (grid.getCellValue(row, col) > 0) {
                            return 'text-success';
                        }
                        return '';
                    }
                },
                {
                    name: "Count Transactions Summary",
                    field: "n_ciTransactions_diff",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'number:0',
                    footerCellFilter: 'number:0',
                    cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                        if (grid.getCellValue(row, col) < 0) {
                            return 'text-danger';
                        } else if (grid.getCellValue(row, col) > 0) {
                            return 'text-success';
                        }
                        return '';
                    }
                },
                {
                    name: "Total Transaction",
                    field: "total_transaction",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'currency:"":0',
                    footerCellFilter: 'currency:"":0',
                },
                {
                    name: "Count Transaction",
                    field: "count_transaction",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'number:0',
                    footerCellFilter: 'number:0',
                },
                {
                    name: "Total Different",
                    field: "total_different",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'currency:"":0',
                    footerCellFilter: 'currency:"":0',
                    cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                        var value = grid.getCellValue(row, col);
                        if (Math.abs(value) > 0.01) { // Tolerance for floating point comparison
                            return value < 0 ? 'text-danger font-weight-bold' : 'text-warning font-weight-bold';
                        }
                        return 'text-success';
                    }
                },
                {
                    name: "Count Different",
                    field: "count_different",
                    width: 160,
                    type: 'number',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellFilter: 'number:0',
                    footerCellFilter: 'number:0',
                    cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                        var value = grid.getCellValue(row, col);
                        if (value !== 0) {
                            return value < 0 ? 'text-danger font-weight-bold' : 'text-warning font-weight-bold';
                        }
                        return 'text-success';
                    }
                },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            data: [],
        };

        $scope.getListData = function () {
            $scope.gridIsLoading = true;

            var date = $scope.convertJsDateToString($scope.filter.date);
            var data = { date: date };

            $http({
                method: "POST",
                url: webservicesUrl + "/reportDifference_list.php", // Updated to use the new webservice
                data: { data: data },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = response.data;
                    
                    if (data.status.toLowerCase() == "ok") {
                        $scope.gridOptions.data = data.records;
                        
                        // Optional: Show summary stats
                        $scope.summaryStats = {
                            totalAgents: data.total_agents,
                            totalCashIn: data.records.reduce((sum, record) => sum + record.n_cashIn, 0),
                            totalTransactions: data.records.reduce((sum, record) => sum + record.total_transaction, 0),
                            totalDifferences: data.records.filter(record => 
                                Math.abs(record.total_different) > 0.01 || record.count_different !== 0
                            ).length
                        };
                        
                    } else {
                        alert(data.message);
                        $scope.gridOptions.data = [];
                    }
                },
                function myError(response) {
                    $scope.gridIsLoading = false;
                    console.log("Error loading agent transaction report:", response.status);
                    alert("Failed to load agent transaction report. Please try again.");
                }
            );
        };

        // Optional: Add export functionality
        $scope.exportToExcel = function() {
            if ($scope.gridOptions.data.length === 0) {
                alert("No data to export");
                return;
            }
            $scope.gridApi.exporter.excelExport('all', 'all');
        };

        // Refresh function
        $scope.refresh = function () {
            $scope.getListData();
        };

        // Load data on controller initialization
        $scope.getListData();
    },
]);
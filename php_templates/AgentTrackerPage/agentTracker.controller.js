app.controller("agentTrackerCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "$interval",
    function ($state, $scope, $http, $timeout, $interval) {

        $scope.gridIsLoading = false;
        $scope.lastUpdate = '';
        $scope.selectedFilter = 'all';
        $scope.searchTerm = '';

        // Dashboard stats
        $scope.stats = {
            totalAgents: 0,
            totalOnline: 0,
            totalOffline: 0,
            onlinePercentage: 0
        };

        // Bank summary data
        $scope.bankStats = [];

        // Auto refresh interval (10 seconds)
        var refreshInterval = null;
        var REFRESH_INTERVAL_MS = 10000;

        // Grid Options
        $scope.gridOptions = {
            showGridFooter: true,
            enableSorting: true,
            showColumnFooter: true,
            enableColumnResizing: true,
            enableGridMenu: true,
            exporterExcelFilename: "AgentTracker.xlsx",
            exporterExcelSheetName: "Agents",
            enableFiltering: true,
            rowTemplate: '<div ng-class="{\'offline-row\': !row.entity.isOnline}" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="gridcell" ui-grid-cell></div>',
            columnDefs: [
                {
                    name: "Status",
                    field: "isOnline",
                    width: 100,
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-style="{\'backgroundColor\': row.entity.isOnline ? \'#10b981\' : \'#ef4444\', \'color\': \'white\', \'textAlign\': \'center\'}">{{row.entity.isOnline ? "ONLINE" : "OFFLINE"}}</div>'
                },
                {
                    name: "Bank Code",
                    field: "bankcode",
                    width: 120
                },
                {
                    name: "Username",
                    field: "username",
                    width: 150
                },
                {
                    name: "Account No",
                    field: "accountNo",
                    width: 150
                },
                {
                    name: "State",
                    field: "state",
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><span class="badge" ng-class="grid.appScope.getStateBadgeClass(row.entity.state)">{{row.entity.state || "IDLE"}}</span></div>'
                },
                {
                    name: "Last Heartbeat",
                    field: "lastHeartbeat",
                    width: 180
                },
                {
                    name: "Last Trx Success",
                    field: "lastTransactionSuccess",
                    width: 180,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.lastTransactionSuccess || "-"}}</div>'
                },
                {
                    name: "Last Trx ID",
                    field: "lastTransactionId",
                    width: 150,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.lastTransactionId || "-"}}</div>'
                },
                {
                    name: "Action",
                    field: "action",
                    width: 100,
                    enableFiltering: false,
                    cellTemplate: '<button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.viewDetail(row.entity)"><i class="fa fa-eye"></i> Detail</button>'
                }
            ],
            data: []
        };

        // Get state badge class
        $scope.getStateBadgeClass = function(state) {
            var stateMap = {
                'IDLE': 'badge-success',
                'DEPOSIT': 'badge-primary',
                'WITHDRAW': 'badge-warning',
                'BUSY': 'badge-info',
                '': 'badge-secondary'
            };
            return stateMap[state] || 'badge-secondary';
        };

        // Get dashboard stats
        $scope.getDashboardStats = function() {
            $http({
                method: "GET",
                url: webservicesUrl + "/AgentTrackerAPI.php",
                params: { action: 'dashboard' }
            }).then(
                function mySuccess(response) {
                    var data = response.data;
                    if (data.status === 'success') {
                        $scope.stats.totalAgents = data.data.totalAgents;
                        $scope.stats.totalOnline = data.data.totalOnline;
                        $scope.stats.totalOffline = data.data.totalOffline;
                        $scope.stats.onlinePercentage = data.data.onlinePercentage;
                        $scope.bankStats = data.data.bankStats;
                        $scope.lastUpdate = data.data.lastUpdate;
                    }
                },
                function myError(response) {
                    console.log("Error fetching dashboard stats:", response);
                }
            );
        };

        // Get all agents data
        $scope.getAgentsData = function(bankcode) {
            $scope.gridIsLoading = true;

            var params = { action: 'agents' };
            if (bankcode) {
                params.bankcode = bankcode;
            }

            $http({
                method: "GET",
                url: webservicesUrl + "/AgentTrackerAPI.php",
                params: params
            }).then(
                function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = response.data;
                    if (data.status === 'success') {
                        // Convert object to array
                        var agents = [];
                        angular.forEach(data.data.agents, function(agent, key) {
                            agents.push(agent);
                        });

                        // Apply filter
                        $scope.allAgents = agents;
                        $scope.applyFilter();
                        $scope.lastUpdate = data.data.lastUpdate;
                    } else {
                        console.log("Error:", data.message);
                    }
                },
                function myError(response) {
                    $scope.gridIsLoading = false;
                    console.log("Error fetching agents:", response);
                }
            );
        };

        // Store all agents for filtering
        $scope.allAgents = [];

        // Apply filter
        $scope.applyFilter = function() {
            var filtered = $scope.allAgents;

            // Filter by status
            if ($scope.selectedFilter === 'online') {
                filtered = filtered.filter(function(a) { return a.isOnline; });
            } else if ($scope.selectedFilter === 'offline') {
                filtered = filtered.filter(function(a) { return !a.isOnline; });
            }

            // Filter by search term
            if ($scope.searchTerm) {
                var search = $scope.searchTerm.toLowerCase();
                filtered = filtered.filter(function(a) {
                    return (a.username && a.username.toLowerCase().indexOf(search) !== -1) ||
                           (a.accountNo && a.accountNo.toLowerCase().indexOf(search) !== -1) ||
                           (a.bankcode && a.bankcode.toLowerCase().indexOf(search) !== -1) ||
                           (a.state && a.state.toLowerCase().indexOf(search) !== -1);
                });
            }

            $scope.gridOptions.data = filtered;
        };

        // Set filter
        $scope.setFilter = function(filter) {
            $scope.selectedFilter = filter;
            $scope.applyFilter();
        };

        // Filter by bank
        $scope.filterByBank = function(bankcode) {
            $scope.selectedBank = bankcode;
            $scope.getAgentsData(bankcode);
        };

        // Clear bank filter
        $scope.clearBankFilter = function() {
            $scope.selectedBank = null;
            $scope.getAgentsData();
        };

        // View agent detail
        $scope.viewDetail = function(agent) {
            $http({
                method: "GET",
                url: webservicesUrl + "/AgentTrackerAPI.php",
                params: {
                    action: 'detail',
                    bankcode: agent.bankcode,
                    accountNo: agent.accountNo
                }
            }).then(
                function mySuccess(response) {
                    var data = response.data;
                    if (data.status === 'success') {
                        $scope.selectedAgent = data.data.agent;
                        $scope.showDetailModal = true;
                    } else {
                        alert("Error: " + data.message);
                    }
                },
                function myError(response) {
                    console.log("Error fetching agent detail:", response);
                    alert("Failed to load agent details");
                }
            );
        };

        // Close detail modal
        $scope.closeDetailModal = function() {
            $scope.showDetailModal = false;
            $scope.selectedAgent = null;
        };

        // Refresh data
        $scope.refresh = function() {
            $scope.getDashboardStats();
            if ($scope.selectedBank) {
                $scope.getAgentsData($scope.selectedBank);
            } else {
                $scope.getAgentsData();
            }
        };

        // Start auto refresh
        $scope.startAutoRefresh = function() {
            if (refreshInterval) {
                $interval.cancel(refreshInterval);
            }
            refreshInterval = $interval(function() {
                $scope.refresh();
            }, REFRESH_INTERVAL_MS);
        };

        // Stop auto refresh
        $scope.stopAutoRefresh = function() {
            if (refreshInterval) {
                $interval.cancel(refreshInterval);
                refreshInterval = null;
            }
        };

        // Get count for filter button
        $scope.getFilterCount = function(filter) {
            if (!$scope.allAgents) return 0;
            if (filter === 'all') return $scope.allAgents.length;
            if (filter === 'online') return $scope.allAgents.filter(function(a) { return a.isOnline; }).length;
            if (filter === 'offline') return $scope.allAgents.filter(function(a) { return !a.isOnline; }).length;
            return 0;
        };

        // Initialize
        $scope.init = function() {
            $scope.selectedBank = null;
            $scope.showDetailModal = false;
            $scope.selectedAgent = null;

            $scope.getDashboardStats();
            $scope.getAgentsData();
            $scope.startAutoRefresh();
        };

        // Cleanup on destroy
        $scope.$on('$destroy', function() {
            $scope.stopAutoRefresh();
        });

        $scope.init();
    }
]);

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

        // Offline reason options
        $scope.offlineReasonOptions = ['PIN LOCK', 'MAX OTP', 'OTP OFFLINE'];

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
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            rowTemplate: '<div ng-class="{\'offline-row\': !row.entity.isOnline}" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="gridcell" ui-grid-cell></div>',
            columnDefs: [
                {
                    name: "Status",
                    field: "isOnline",
                    width: 90,
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-style="{\'backgroundColor\': row.entity.isOnline ? \'#10b981\' : \'#ef4444\', \'color\': \'white\', \'textAlign\': \'center\', \'fontWeight\': \'bold\', \'fontSize\': \'11px\'}">{{row.entity.isOnline ? "ONLINE" : "OFFLINE"}}</div>'
                },
                {
                    name: "Offline Duration",
                    field: "offlineDuration.text",
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-style="{\'color\': !row.entity.isOnline ? \'#ef4444\' : \'#9ca3af\', \'fontWeight\': !row.entity.isOnline ? \'bold\' : \'normal\'}">{{row.entity.isOnline ? "-" : row.entity.offlineDuration.text}}</div>',
                    sortingAlgorithm: function(a, b, rowA, rowB) {
                        var secA = rowA.entity.offlineDuration ? rowA.entity.offlineDuration.seconds : 0;
                        var secB = rowB.entity.offlineDuration ? rowB.entity.offlineDuration.seconds : 0;
                        return secA - secB;
                    }
                },
                {
                    name: "Disconnect Today",
                    field: "disconnectCountToday",
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center;"><span class="badge" ng-class="{\'badge-danger\': row.entity.disconnectCountToday > 3, \'badge-warning\': row.entity.disconnectCountToday > 1 && row.entity.disconnectCountToday <= 3, \'badge-success\': row.entity.disconnectCountToday <= 1}">{{row.entity.disconnectCountToday || 0}}</span></div>'
                },
                {
                    name: "Offline Reason",
                    field: "offlineReason",
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-if="row.entity.offlineReason" class="badge" ng-class="grid.appScope.getReasonBadgeClass(row.entity.offlineReason)">{{row.entity.offlineReason}}</span><span ng-if="!row.entity.offlineReason && !row.entity.isOnline" style="color: #9ca3af;">-</span></div>'
                },
                {
                    name: "Bank Code",
                    field: "bankcode",
                    width: 100
                },
                {
                    name: "Username",
                    field: "username",
                    width: 140
                },
                {
                    name: "Account No",
                    field: "accountNo",
                    width: 140
                },
                {
                    name: "State",
                    field: "state",
                    width: 100,
                    cellTemplate: '<div class="ui-grid-cell-contents"><span class="badge" ng-class="grid.appScope.getStateBadgeClass(row.entity.state)">{{row.entity.state || "IDLE"}}</span></div>'
                },
                {
                    name: "Last Heartbeat",
                    field: "lastHeartbeat",
                    width: 150
                },
                {
                    name: "Last Trx",
                    field: "lastTransactionSuccess",
                    width: 150,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.lastTransactionSuccess || "-"}}</div>'
                },
                {
                    name: "Action",
                    field: "action",
                    width: 120,
                    enableFiltering: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.viewDetail(row.entity)" style="margin-right:3px;" title="View Detail"><i class="fa fa-eye"></i></button><button type="button" class="btn btn-warning btn-xs" ng-click="grid.appScope.openReasonModal(row.entity)" ng-show="!row.entity.isOnline" title="Mark Reason"><i class="fa fa-tag"></i></button></div>'
                }
            ],
            data: [],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
            }
        };

        // Get reason badge class
        $scope.getReasonBadgeClass = function(reason) {
            var reasonMap = {
                'PIN LOCK': 'badge-danger',
                'MAX OTP': 'badge-warning',
                'OTP OFFLINE': 'badge-info'
            };
            return reasonMap[reason] || 'badge-secondary';
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
                        var agents = [];
                        angular.forEach(data.data.agents, function(agent, key) {
                            agent.agentKey = key;
                            agents.push(agent);
                        });

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

            if ($scope.selectedFilter === 'online') {
                filtered = filtered.filter(function(a) { return a.isOnline; });
            } else if ($scope.selectedFilter === 'offline') {
                filtered = filtered.filter(function(a) { return !a.isOnline; });
            }

            if ($scope.searchTerm) {
                var search = $scope.searchTerm.toLowerCase();
                filtered = filtered.filter(function(a) {
                    return (a.username && a.username.toLowerCase().indexOf(search) !== -1) ||
                           (a.accountNo && a.accountNo.toLowerCase().indexOf(search) !== -1) ||
                           (a.bankcode && a.bankcode.toLowerCase().indexOf(search) !== -1) ||
                           (a.state && a.state.toLowerCase().indexOf(search) !== -1) ||
                           (a.offlineReason && a.offlineReason.toLowerCase().indexOf(search) !== -1);
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

        // Open reason modal for single agent
        $scope.openReasonModal = function(agent) {
            $scope.reasonModalAgent = agent;
            $scope.reasonModalMode = 'single';
            $scope.selectedReason = agent.offlineReason || '';
            $scope.showReasonModal = true;
        };

        // Open bulk reason modal
        $scope.openBulkReasonModal = function() {
            var selected = $scope.gridApi.selection.getSelectedRows();
            var offlineSelected = selected.filter(function(a) { return !a.isOnline; });
            
            if (offlineSelected.length === 0) {
                alert('Please select at least one offline agent');
                return;
            }
            
            $scope.bulkSelectedAgents = offlineSelected;
            $scope.reasonModalMode = 'bulk';
            $scope.selectedReason = '';
            $scope.showReasonModal = true;
        };

        // Close reason modal
        $scope.closeReasonModal = function() {
            $scope.showReasonModal = false;
            $scope.reasonModalAgent = null;
            $scope.bulkSelectedAgents = [];
            $scope.selectedReason = '';
        };

        // Set offline reason
        $scope.setOfflineReason = function(reason) {
            $scope.selectedReason = reason;
        };

        // Save offline reason
        $scope.saveOfflineReason = function() {
            if ($scope.reasonModalMode === 'single') {
                $http({
                    method: "POST",
                    url: webservicesUrl + "/AgentTrackerAPI.php",
                    data: {
                        action: 'setOfflineReason',
                        bankcode: $scope.reasonModalAgent.bankcode,
                        accountNo: $scope.reasonModalAgent.accountNo,
                        reason: $scope.selectedReason
                    }
                }).then(
                    function mySuccess(response) {
                        if (response.data.status === 'success') {
                            $scope.reasonModalAgent.offlineReason = $scope.selectedReason;
                            $scope.closeReasonModal();
                            $scope.refresh();
                        } else {
                            alert("Error: " + response.data.message);
                        }
                    },
                    function myError(response) {
                        alert("Failed to update offline reason");
                    }
                );
            } else {
                var agentKeys = $scope.bulkSelectedAgents.map(function(a) {
                    return a.bankcode + '-' + a.accountNo;
                });
                
                $http({
                    method: "POST",
                    url: webservicesUrl + "/AgentTrackerAPI.php",
                    data: {
                        action: 'bulkSetOfflineReason',
                        agentKeys: agentKeys,
                        reason: $scope.selectedReason
                    }
                }).then(
                    function mySuccess(response) {
                        if (response.data.status === 'success') {
                            $scope.closeReasonModal();
                            $scope.refresh();
                        } else {
                            alert("Error: " + response.data.message);
                        }
                    },
                    function myError(response) {
                        alert("Failed to update offline reasons");
                    }
                );
            }
        };

        // Clear offline reason (single)
        $scope.clearOfflineReason = function() {
            $http({
                method: "POST",
                url: webservicesUrl + "/AgentTrackerAPI.php",
                data: {
                    action: 'setOfflineReason',
                    bankcode: $scope.reasonModalAgent.bankcode,
                    accountNo: $scope.reasonModalAgent.accountNo,
                    reason: ''
                }
            }).then(
                function mySuccess(response) {
                    if (response.data.status === 'success') {
                        $scope.reasonModalAgent.offlineReason = '';
                        $scope.closeReasonModal();
                        $scope.refresh();
                    } else {
                        alert("Error: " + response.data.message);
                    }
                },
                function myError(response) {
                    alert("Failed to clear offline reason");
                }
            );
        };

        // Bulk clear offline reason
        $scope.bulkClearOfflineReason = function() {
            var agentKeys = $scope.bulkSelectedAgents.map(function(a) {
                return a.bankcode + '-' + a.accountNo;
            });
            
            $http({
                method: "POST",
                url: webservicesUrl + "/AgentTrackerAPI.php",
                data: {
                    action: 'bulkSetOfflineReason',
                    agentKeys: agentKeys,
                    reason: ''
                }
            }).then(
                function mySuccess(response) {
                    if (response.data.status === 'success') {
                        $scope.closeReasonModal();
                        $scope.refresh();
                    } else {
                        alert("Error: " + response.data.message);
                    }
                },
                function myError(response) {
                    alert("Failed to clear offline reasons");
                }
            );
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

        // Get offline agents without reason count
        $scope.getUnmarkedOfflineCount = function() {
            if (!$scope.allAgents) return 0;
            return $scope.allAgents.filter(function(a) { 
                return !a.isOnline && !a.offlineReason; 
            }).length;
        };

        // Initialize
        $scope.init = function() {
            $scope.selectedBank = null;
            $scope.showDetailModal = false;
            $scope.showReasonModal = false;
            $scope.selectedAgent = null;
            $scope.reasonModalAgent = null;
            $scope.reasonModalMode = 'single';
            $scope.bulkSelectedAgents = [];
            $scope.selectedReason = '';

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
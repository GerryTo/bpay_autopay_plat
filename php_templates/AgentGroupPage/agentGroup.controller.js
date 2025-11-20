app.controller('agentGroupCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function(){
	    return window.innerHeight - 180;
    }
    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableColumnResizing: true,
        onRegisterApi :function(gridApi){ $scope.gridApi = gridApi; },
        rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Group Name', field: 'agentgroupname' },
            { name: 'Active', field: 'active' },
            {
                name: 'Action', field: 'agentgroupid',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' + $scope.globallang.edit + '</button><button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.delete(row.entity)">' + $scope.globallang.delete + '</button>'
            }
        ],
        data: []
    };

    $scope.getListData = function () {
        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/agentgroup/list.php",
            data: { 'searchkey': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;

            response = response.data;
            // var data = CRYPTO.decrypt(response.data.data);
            if (response.status.toLowerCase() == 'success') {
                $scope.gridOptions.data = response.data;
            } else {
                alert(response.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }

    $scope.new = function () {
        $state.go('agentgroup-form', { data:{ id: 0, name: '', active: 'Yes' } });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.edit = function (data) {
        $state.go('agentgroup-form', { data: { id: data.agentgroupid, name:data.agentgroupname, active: data.active } });
    }
    $scope.delete = function (data) {
        if (confirm('Are you sure want to delete [' + data.agentgroupname+ ']?')) {
            var data = { id: data.agentgroupid};
            // var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/agentgroup/delete.php",
                data: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                // var data = CRYPTO.decrypt(response.data.data);
                response = response.data;
                if (response.status.toLowerCase() == 'ok') {
                    $scope.getListData();
                } else {
                    alert(response.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]); 

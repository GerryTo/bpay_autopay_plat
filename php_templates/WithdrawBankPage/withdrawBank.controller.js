app.controller('withdrawBankCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {


    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function(){
        return window.innerHeight - 180;
    }

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
	    enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            //{ name: 'QueueID', field: 'id', aggregationType: uiGridConstants.aggregationTypes.count },
            { name: 'Bank Code', field: 'bankcode', width:120 },
            { name: 'Is Enabled', field: 'isenabled', width:120 },
            /*{ name: 'Currency', field: 'ccy', width:100 },
            { name: 'Amount', field: 'amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2', type:'number',aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>', width:120 },
            { name: 'Client Timestamp', field: 'timestamp',width:120 },
            { name: 'IP', field: 'ip' , width:150, hide:true},
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Dest Bank Account', field: 'dstbankaccount' , width:150},
            { name: 'Dest Account Name', field: 'accountname', width:150 },
            { name: 'TransactionID', field: 'transactionid', width:100 },
            { name: 'Status', field: 'status', width : 150 },
            { name: 'Message', field: 'message', width : 150 },
            { name: 'Future ID', field: 'futureid', width : 150 },
            { name: 'Parent Future ID', field: 'parentfutureid', width : 150 },
            { name: 'Type', field: 'type', width : 150 },
            */
            {
                name: 'Action', field: 'bankcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.isenabled == \'N\'" ng-click="grid.appScope.toggleEnabled(row.entity, \'Y\')">Enabled</button> <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.toggleEnabled(row.entity, \'N\')" ng-show="row.entity.isenabled == \'Y\'"  >Disabled</button> ' , width:260
            }

        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };
    
    $scope.getListData = function () {
        $scope.gridIsLoading = true;

        //var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        //var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        //var data = { 'datefrom' : from, 'dateto': to };
        //var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/getWithdrawBank.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.gridOptions.data = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }

    $scope.toggleEnabled = function(data, status){

        var data = { 'id' : data.id, 'status': status };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/setWithdrawBankStatus.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.refresh();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            //$scope.gridIsLoading = false;
            console.log(response.status);
        });

    }

    $scope.refresh = function () {
        $scope.getListData();
    }
    

    $scope.init = function () {
        $scope.getListData();
        $timeout(function(){
            $scope.getListData();
        },30000);
	    
    }
    $scope.init();
}]); 



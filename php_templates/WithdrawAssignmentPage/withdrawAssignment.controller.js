app.controller('withdrawAssignmentCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

    //----datepicker----
    $scope.datepickerConfig = {
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
        format: 'dd-MMMM-yyyy',
        altInputFormats: ['M!/d!/yyyy']
    }
    
    $scope.dateOptions = {
        //dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(),
        //minDate: new Date(),
        startingDay: 1
    };
    $scope.popup1 = {
        opened: false
    };
    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };
    $scope.popup2 = {
        opened: false
    };
    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };
    $scope.filter = {
        fromdate : new Date(),
        todate: new Date(),
    }
    //------------------

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
            { name: 'FutureID', field: 'id', aggregationType: uiGridConstants.aggregationTypes.count,
                sort:{
                    direction: uiGridConstants.DESC,
                    priority: 0
                }
            },
            { name: 'System Timestamp', field: 'insert', sort: { direction: 'desc' }, width:120  },
            { name: 'MerchantID', field: 'merchantcode', width:120 },
            { name: 'Customer Code', field: 'customercode', width:120 },
            //{ name: 'Currency', field: 'ccy', width:100 },
            { name: 'Amount', field: 'amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number',aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>', width:120 },
            { name: 'Client Timestamp', field: 'timestamp',width:120 },
            { name: 'Original Timestamp', field: 'originaldate', width:120  },
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Dest Bank Account', field: 'dstbankaccount' , width:150},
            { name: 'Dest Account Name', field: 'accountname', width:150 },
            { name: 'TransactionID', field: 'transactionid', width:100 },
            { name: 'Fee', field: 'fee', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number',aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>', width:100 },
            { name: 'Status', field: 'status', width : 150 },
            { name: 'Notes 2', field: 'notes2', width : 150 },
            { name: 'Notes 3', field: 'notes3', width : 150 },
            { name: 'Agent Assign', field: 'agentAlias', width:100 },
            { name: 'Status Assign', field: 'assignStatusDesc', width:100 },
            {
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.agentUser == \'\'" ng-click="grid.appScope.assign(row.entity)">Assign</button>' 
                    + '<button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.agentUser != \'\'" ng-click="grid.appScope.assign(row.entity)">Re-Assign</button>' 
                    //+' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>'
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'" >Fail</button>',
                width:260
            }

        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };
    
    $scope.getListData = function () {
        $scope.gridIsLoading = true;

        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var data = { 'datefrom' : from, 'dateto': to };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/withdrawAssignment_list.php",
            data: { 'data': jsonData },
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

	$scope.Fail = function(dataParam) {
		var data = { 'id' : dataParam, fail: 'Y' };
		var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/changeStatusSuccessTransactionAccountByCompany.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                alert('Success!');
                $scope.getListData();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });		
	
	}

    /**
     * 
     * update by Rusman
     * 2021-01-27
     * add check function
     */

    $scope.check = function(id){
        var data = { 'id' : id };
        var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/withdrawList_check.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                //alert('Success!');
                $scope.getListData();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.assign = function(data){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'js/Modal/WithdrawAssignModal/WithdrawAssignModal.template.html',
            controller: 'withdrawAssignModalCtrl',
            scope: $scope,
            resolve: {
                params: function(){
                    return { bankcode: data.bankcode };
                }
            }
        });
        modalInstance.result.then(function (returnValue) {
            
            var params = { 'id' : data.id, 
                accountNo: returnValue.accountNo, 
                bankCode: returnValue.bankCode, 
                accountName: returnValue.accountName, 
                username: returnValue.username,
            };
            console.log(params);
            var jsonData = CRYPTO.encrypt(params);
            $http({
                method: "POST",
                url: webservicesUrl + "/withdrawAssignment_assign.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Assignment Success!');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }, function () {
            //console.log('Modal dismissed at: ' + new Date());
        });
    }

    /*$scope.edit = function (data) {
        $state.go('withdraw-form', { data: { merchantcode: data.merchantcode, customercode:data.customercode, id:data.id, bankcode:data.bankcode, amount:data.amount, accountno:data.accountno, dstbankaccount:data.dstbankaccount, merchant:data.merchant, ccy:data.ccy , FutureID:data.id } });
    }*/

    $scope.updateTrx = function(manualstatus, id, accountdest, memo = ''){
        var data = { 'id' : id, 'status': manualstatus, 'accountdest':accountdest, 'memo': memo };
        var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/updateManualTransaction.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                alert('Data Saved');
                                $scope.getListData();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }
    $scope.cancel = function(data) {
        if(confirm('Are you sure want to fail this transaction ['+data.id+']?')){

            var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: 'templates/failModal.html?v=2',
               controller: 'failModalCtrl',
               size: 'sm',
               scope: $scope
            });

            modalInstance.result.then(function (returnValue) {
                //alert(returnValue)
                $scope.updateTrx('C',data.id, '', returnValue);
                
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

        }
    }
    
   
	 $scope.Manual = function(data) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'templates/accountModal.html',
            controller: 'selectAccountModalCtrl',
            size: 'sm',
            scope: $scope
        });
        modalInstance.result.then(function (returnValue) {
            if( returnValue.length>3 ) {
                $scope.updateTrx('E', data.id, returnValue);        
            }
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}

    $scope.init = function () {
        $scope.getListData();
        $timeout(function(){
            $scope.getListData();
        },60000);
    }
    $scope.init();
}]);
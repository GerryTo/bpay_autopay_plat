app.controller('withdrawQueueCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', '$rootScope', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval, $rootScope ) {


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
        exporterExcelFilename: 'withdraw-queue.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'QueueID', field: 'id', aggregationType: uiGridConstants.aggregationTypes.count, 
                sort:{
                    direction: uiGridConstants.DESC,
                    priority: 0
                }
            },
            { name: 'MerchantID', field: 'merchantcode', width:120 },
            { name: 'Customer Code', field: 'customercode', width:120 },
            //{ name: 'Currency', field: 'ccy', width:100 },
            { name: 'Amount', field: 'amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number',aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>', width:120 },
            { name: 'Client Timestamp', field: 'transtime',width:120 },
            //{ name: 'IP', field: 'ip' , width:150, hide:true},
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Dest Bank Account', field: 'dstbankaccount' , width:150},
            { name: 'Dest Account Name', field: 'accountname', width:150 },
            { name: 'TransactionID', field: 'transactionid', width:100 },
            { name: 'Status', field: 'status', width : 150 },
            { name: 'Message', field: 'message', width : 150 },
            { name: 'Future ID', field: 'futureid', width : 150 },
            { name: 'Parent Future ID', field: 'parentfutureid', width : 150 },
            { name: 'Type', field: 'type', width : 150 },
            {
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.isdone == \'N\'" ng-click="grid.appScope.proceed(row.entity)">'+$scope.globallang.proceed+'</button> ' + 
                    //'<button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.isdone == \'N\'" ng-click="grid.appScope.cancel(row.entity)">Cancel</button> ' + 
                    //'<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.isdone == \'N\'" ng-click="grid.appScope.testing(row.entity)">testing</button> ' , 
                    '',
                width:150
            }

        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    /*$scope.proceed = function(data){
        if(confirm('Are you sure want to proceed this withdraw ['+data.id+']?')){
            window.open(sispayUi + '?id='+data.id, '_self');
        }
    }*/

    $scope.proceed = function(data){
        if(confirm('Are you sure want to proceed this withdraw ['+data.id+']?')){
            window.open(sispayUi2 + '?id='+data.id, '_self');
        }
    }
    
    $scope.getListData = function () {
        $scope.gridIsLoading = true;

        //var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        //var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        //var data = { 'datefrom' : from, 'dateto': to };
        var data = { 'data' : '' };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/getWithdrawQueue.php",
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
	$scope.TimeOut = function(dataParam) {
			
		var data = { 'id' : dataParam, timeOut: 'Y',typeWidhdrawList : '1' };
		console.log(data);
		//return false;
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
	
	
	
    $scope.Success = function(dataParam) {
                var modalInstance = $uibModal.open({
                       animation: true,
                       templateUrl: 'templates/accountModal.html',
                       controller: 'selectAccountSourceModalCtrl',
                       size: 'sm',
                       scope: $scope
                });
                modalInstance.result.then(function (returnValue) {
                        if( returnValue.length>3 ) {
                                var data = { 'id' : dataParam, account:returnValue };
                                console.log(data);
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
		 }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                });

        }

    $scope.refresh = function () {
        $scope.getListData();
    }

	

    $scope.updateTrx = function(manualstatus, id, accountdest, memo = ''){
        var data = { 'id' : id, 'status': manualstatus, 'accountdest':accountdest, 'memo': memo };
        var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/updateManualWithdrawQueue.php",
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
        if(confirm('Are you sure want to cancel this transaction ['+data.id+']?')){

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

    $scope.receipt = function (data) {
        console.log(data);
        var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: 'templates/picModal.html?v=4',
               controller: 'picModalCtrl',
               size: 'lg',
               resolve: {
                  futuretrxid : function () {
                     return data.futuretrxid;
                  },
                  piclocation: function () {
                     return data.location;
                  },
               },
               scope: $scope
        });
        modalInstance.result.then(function (returnValue) {
        }, function () {
                console.log('Modal dismissed at: ' + new Date());
        });
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
                                //console.log("return value "+returnValue);
			}
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}

    $scope.init = function () {
        $scope.getListData();
        
        $rootScope.pageInterval = $interval(function(){
            $scope.getListData();
        }, 10000);
	    
    }
    $scope.init();
}]); 



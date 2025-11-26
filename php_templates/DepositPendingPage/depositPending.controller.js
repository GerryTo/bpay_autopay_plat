app.controller('depositPendingCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal) {

    $scope.datepickerConfig = {
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
        format: 'dd-MMMM-yyyy',
        altInputFormats: ['M!/d!/yyyy']
    }
    $scope.Balance={};
    $scope.Summary = {
        pendingDB:0,
        pendingCR:0,
        DB:0,
        CR:0,
        fee:0
        }; 
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
        transId: ''
    }
    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: 'deposit-pending.xlsx',
        exporterExcelSheetName: 'Sheet1',
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Future Trx ID', field: 'futuretrxid', aggregationType: uiGridConstants.aggregationTypes.count, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>', 
              sort: {
                direction: uiGridConstants.DESC,
                priority: 0
               }
            },
            { name: 'Date', field: 'timestamp', width:150  },
            { name: 'Merchant Code', field: 'merchantcode', width:100 },
            { name: 'Customer Code', field: 'customercode', width:180 },
            { name: 'CCY', field: 'ccy', visible:false },
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Amount', field: 'amount', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:100,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Trans Type', field: 'transactiontype', width:100 },
            { name: 'Status', field: 'description', width:120 },
            { name: 'Callback Status', field: 'callbackresponse', width:150, cellTooltip: 
                function( row, col ) {
                    return row.entity.callbackresponse;
                }
            },
            { name: 'Account Src', field: 'accountsrc', visible:false },
            { name: 'Fee', field: 'fee', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:100,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Notes', field: 'notes' , width:150},
            { name: 'Notes 2', field: 'notes2' , width:150},
            { name: 'Notes 3', field: 'notes3' , width:150},
			//{ name: 'Actual Transaction Date', field: 'notesactualdate' , width:150}, 
            { name: 'Trans ID', field: 'transactionid', width:100 },
            { name: 'Reference', field: 'reference', visible:false },
            { name: 'Alias', field: 'alias' , width:100},
            { name: 'Acc Source', field: 'accountno' , width:100},
            { name: 'Acc Source Name', field: 'accountsrcname' , width:100},
            { name: 'Acc Dest', field: 'accountdst' , width:100},
            { name: 'Acc Dest Name', field: 'accountdstname' , width:100},
            // { name: 'Memo', field: 'memo', width:100 },
            
            {
                name: 'Action', field: 'futuretrxid', width:250,
                cellTemplate: '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)" ng-show="row.entity.status == \'9\'"  >Edit</button>'
                    + '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessDeposit(row.entity.futuretrxid)" ng-show="row.entity.status == \'9\'" >Success</button>'
                    + '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'9\'"  >Fail</button>'
                    // + '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.resend(row.entity)" ng-show="false">Resend</button>'
                    // + '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'W\' "  ng-disabled="row.entity.disable ==\'1\'" >Success</button>'
                    // + '<button type="button" class="btn btn-default btn-sm" style="margin-right:2px;" ng-click="grid.appScope.Mutasi(row.entity)" ng-show="(row.entity.status == \'Order need to check\' || row.entity.status == \'Transaction Success\' ) && row.entity.transactiontype == \'D\' && row.entity.matchMutasi == \'0\'"  >Mutasi</button>'
                    // + '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\'" || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'" >Receipt</button>'
                    // + '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.Approve(row.entity.futuretrxid)" ng-show="grid.appScope.validate(row.entity)" >Approve</button>'
			}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.validate = function(row){
        //((row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Pending\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Transaction Failed\' && row.entity.transactiontype == \'D\')) && row.entity.disable ==\'1\' && (\''+$scope.currentLoginInfo.type+'\'==\'S\' || \''+$scope.currentLoginInfo.type+'\' == \'A\')
        if(
            ((row.status == 'Order need to check' && row.transactiontype == 'D') ||
            (row.status == 'Pending' && row.transactiontype == 'D') ||
            (row.status == 'Transaction Failed' && row.transactiontype == 'D')) &&
            row.disable == '1' && $scope.currentLoginInfo.type == 'S'
        )
            return true;
        else
        return false;
    }

    $scope.Mutasi = function(dataParam){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'js/Modal/MutasiModal/MutasiModal.template.html?v=2',
            controller: 'MutasiModalCtrl',
            size: 'lg',
            scope: $scope,
            resolve:{
                items: function(){
                    return { bank: dataParam.bankcode, accountNo: dataParam.accountdst }
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            var params = { futuretrxid : dataParam.futuretrxid, id:returnValue.id };    // id : array()

            var jsonData = CRYPTO.encrypt(params);
            $http({
                method: "POST",
                url: webservicesUrl + "/depositQueue_matchedMutasi.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Mutasi Matching Success!');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    $scope.edit = function(data){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'js/Modal/TransactionEditModal/TransactionEditModal.template.html?v=2',
            controller: 'transactionEditModalCtrl',
            size: 'md',
            scope: $scope,
            resolve: {
                params: function(){
                    return data;
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            var params = { 'id' : data.futuretrxid, amount:returnValue.amount, note: returnValue.note };

            var jsonData = CRYPTO.encrypt(params);
            $http({
                method: "POST",
                url: webservicesUrl + "/transactionByAccount_edit.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Edit Amount Success!');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    /*SUCCESS DEPOSI*/
	
	$scope.SuccessDeposit = function(dataParam){

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'templates/successDepositManualModal.html?v=1',
            controller: 'successDepositManualModalCtrl',
            size: 'md',
            scope: $scope,
            resolve:{
                dataParam: function(){
                    return dataParam
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            
            var data = { 'id' : dataParam, transid:returnValue.transid };
                                
            var jsonData = CRYPTO.encrypt(data);
            $http({
                method: "POST",
                url: webservicesUrl + "/depositPending_success.php",
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

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
				
	}

    $scope.resend = function(data){
        if(confirm('are you sure want to resend this transaction?')){
            var data = { 'id' : data.futuretrxid };
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/resendTransaction.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Resend Success');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }

	
	$scope.updateTrx = function(manualstatus, id, accountdest){
        //var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var data = { 'id' : id, 'status': manualstatus, 'accountdest':accountdest };
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

	$scope.receipt = function (data) {
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
	$scope.cancel = function(data) {
		$scope.updateTrx('C',data.futuretrxid, '');
	}
	$scope.ManualSuccess= function(data) {
		$scope.updateTrx('S',data.futuretrxid, '');
	}


    $scope.SuccessWithUploadReceipt = function(dataParam){
        var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: 'templates/successModal.html?v='+(new Date().getTime()),
               controller: 'successModalCtrl',
               size: 'md',
               scope: $scope
        });

        modalInstance.result.then(function (returnValue) {
            var data = { 'id' : dataParam, account:returnValue.accountDest, bankcode: returnValue.bankCode, receipt: returnValue.receiptFile };
                                
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

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }
	
	$scope.Success = function(dataParam) {
		var modalInstance = $uibModal.open({
                       animation: true,
                       templateUrl: 'templates/accountModal.html?v=1',
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
	
	$scope.Manual = function(data) {
		var modalInstance = $uibModal.open({
                       animation: true,
                       templateUrl: 'templates/accountModal.html?v=1',
                       controller: 'selectAccountModalCtrl',
                       size: 'sm',
                       scope: $scope
                });
		modalInstance.result.then(function (returnValue) {
			if( returnValue.length>3 ) {
				if( returnValue!=data.accountdst) {
					$scope.updateTrx('E', data.futuretrxid, returnValue);
				} else {
					alert("Account source should be diffrent with account destination");
				}
				//console.log("return value "+returnValue);
			}
                }, function () {
                 	console.log('Modal dismissed at: ' + new Date());
                });
	}

    $scope.getListData = function () {
    
        if($scope.filter.transId == ''){
            alert('Please Input Transaction Id');
            return false;
        }

        var data = { 'transId' : $scope.filter.transId };
        var jsonData = CRYPTO.encrypt(data);

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/depositPending_getTransactionByTransId.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
	        
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                data.records = $scope.urlDecode(data.records);
                $scope.gridOptions.data = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        var info = localStorage.getItem('bropay-login-info');
        if(info){
          try{
            $scope.currentLoginInfo = JSON.parse(info);
          }catch(err){}
        }
    }
    $scope.init();
}]);
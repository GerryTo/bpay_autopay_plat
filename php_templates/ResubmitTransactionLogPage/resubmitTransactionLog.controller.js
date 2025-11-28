app.controller('resubmitTransactionLogCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

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
        // fromdate : new Date(),
        // todate: new Date(),
        trxid: ""
    }
    //------------------

    //$scope.products = [];
    $scope.gridIsLoading = false;
    $scope.getHeight = function(){
        return window.innerHeight - 180;
    }

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
	    enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: 'report-transaction-log.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Date', field: 'date'},
            { name: 'Filter', field: 'filter'},
            { name: 'Number of Transaction', field: 'count'},
            { name: 'Success Transaction', field: 'success'},
            { name: 'Is Finished', field: 'isfinished'},
            { name: 'Finished Date', field: 'finisheddate'},
            { name: 'Finished Date', field: 'finisheddate'},
            // { name: 'No. of SMS', field: 'noSms', width:120  },
            // { name: 'Total Amount', field: 'amount', width:180, type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit },
            /*{ name: 'Bank', field: 'type', width:120  },
            { name: 'Trx ID', field: 'securitycode', width:120 },
            { name: 'Customer Phone', field: 'customerphone', width:120 },
            { name: 'Amount', field: 'amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number', width:120 },
            { name: 'Message', field: 'message' },*/
            // { name: 'Future Trx ID', field: 'futuretrxid', width:120,
            //     cellTemplate: '<div style="padding:5px;">{{ row.entity.futuretrxid == -1 ? "Expired" : row.entity.futuretrxid }}</div>'
            // },
            {
                name: 'Action', width:94, 
                cellTemplate: '<button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.detail(row.entity)">Detail</button>'
            }

        ],
	onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {
        $scope.gridIsLoading = true;

        // var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        // var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        // var data = { 'datefrom' : from, 'dateto': to };
        // var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/resubmitLog_getList.php",
            data: { 'data': $scope.filter },
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

    $scope.detail = function(dataParam){
        var modalInstance = $uibModal.open({
            animation: true,
            template: `
            <div class="modal-header">
                <h3 class="modal-title">List Transaction </h3>
            </div>
            <div class="modal-body">
                <div class="row" style="margin-bottom:8px;">
                  <div class="col-xs-12 col-sm-4 col-md-2 col-lg-2">
                    <button class="btn btn-default btn-sm" type="button" ng-click="getList()">Refresh</button>&nbsp; &nbsp;&nbsp;
                  </div>
                </div>
                <div id="grid1" ui-grid="gridOptions" class="grid" ui-grid-resize-columns ui-grid-auto-resize >
                    <div class="grid-nodata-container" ng-show="gridOptions.data.length == 0 && !gridIsLoading">No Data Available</div>
                    <div class="grid-loading-container" ng-show="gridIsLoading">
                        <img src="images/loading.gif" />
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-warning" type="button" ng-click="$close()">Close</button>
            </div>
            `,
            controller: 'resubmitTransactionLogModalCtrl',
            size: 'lg',
            scope: $scope,
            resolve:{
                items: function(){
                    return { id: dataParam.id }
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            // var data = { 
            //     futuretrxid : returnValue.futuretrxid,
            //     amount: dataParam.amount, 
            //     bank: dataParam.type, 
            //     trxid: dataParam.securitycode, 
            //     phonenumber: dataParam.customerphone
            // };

            // console.log(data);
                                
            // var jsonData = CRYPTO.encrypt(data);
            // $http({
            //     method: "POST",
            //     url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
            //     data: { 'data': jsonData },
            //     headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            // }).then(function mySuccess(response) {
            //     var data = CRYPTO.decrypt(response.data.data);
            //     if (data.status.toLowerCase() == 'ok') {
            //         alert('Success!');
            //         $scope.getListData();
            //     } else {
            //         alert(data.message);
            //     }
            // }, function myError(response) {
            //     console.log(response);
            // });

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }


    $scope.init = function () {
        // $scope.getListData();
        
    }
    $scope.init();
}]); 



app.controller('resubmitTransactionLogModalCtrl', ['$scope', '$uibModalInstance', '$uibModal', 'items', '$http' , function ($scope, $uibModalInstance,  $uibModal, items, $http) {
	$scope.data={
		id:'',
	};

	$scope.gridIsLoading = false;
		$scope.gridOptions = {
		enableSorting: true,
		showColumnFooter: true,
		enableColumnResizing: true,
		enableGridMenu: true,        
		rowTemplate:'templates/rowTemplate.html',
		columnDefs: [
		    { name: 'Trx Id', field: 'trxid' },
		    { name: 'FutureTrx Id', field: 'futuretrxid' },
		    { name: 'reason', field: 'reason' },
		],
		onRegisterApi: function( gridApi ) {
			$scope.gridApi = gridApi;
		},
		data: []
    };

	$scope.getList = function() 	{
		
        var data = { 
            id: $scope.data.id, 
        };

        console.log(data);

        var jsonData = CRYPTO.encrypt(data);
        $scope.gridIsLoading = true;

        $http({
            method: "POST",
            url: webservicesUrl + "/resubmitLogDetail_getList.php",
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


	$scope.init=function() {
		$scope.data.id = items.id;
		$scope.getList();
	}
	$scope.init();
}]);
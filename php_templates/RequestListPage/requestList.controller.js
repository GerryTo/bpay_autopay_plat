app.controller('requestListCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    //$scope.products = [];
	$scope.resData = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function(){
	return window.innerHeight - 180;
     }
    $scope.gridIsLoading = false;

    $scope.gridOptions = {
        enableSorting: true,
        enableFiltering: true,
        showColumnFooter: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: 'setlement-topup-list.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    onRegisterApi :function(gridApi){ $scope.gridApi = gridApi; },
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Date', field: 'date', aggregationType: uiGridConstants.aggregationTypes.count, width :120 },
            { name: 'Future ID', field: 'futureid',width :100 },
            { name: 'Merchant Code', field: 'merchant', width:120 },
            { name: 'User', field: 'user', width:100 },
            { name: 'Type', field: 'type', width:100 },
            { name: 'Timestamp', field: 'timestamp',width :120 },
            { name: 'Bank', field: 'bank' , width : 150},
            { name: 'Bank Account', field: 'account' , width :100},
            { name: 'Account Name', field: 'accountname', width :150 },
            { name: 'Amount', field: 'amount', width :100, cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number' },
            { name: 'Status', field: 'status', width:100 },
            { name: 'Notes', field: 'note', width :200 },
			{ name: 'Notes 2', field: 'note2', width :200 },
	        {
                name: 'Action', field: 'merchantcode', width :300,
                //cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.status== \'Pending\'"  ng-click="grid.appScope.executeReq(row.entity)">Executed</button> <button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.status == \'Pending\'"  ng-click="grid.appScope.deleteReq(row.entity)">Cancelled</button>'
				cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.status== \'Pending\'"  ng-click="grid.appScope.executeReq(row.entity)">Executed</button> <button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.status== \'Pending\' && row.entity.type== \'Withdraw\' && row.entity.merchant !==  \'\' "  ng-click="grid.appScope.executeSemi(row.entity)">Executed Semi</button> <button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.status == \'Pending\'"  ng-click="grid.appScope.formCancel(row.entity)">Cancelled</button>'
					
			}
        ],
        data: []
    };

    $scope.getListData = function () {
        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/getRequestList.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
		if( typeof data.records != 'undefined') {
			for(var i=0, length=data.records.length;i<length;i++) {
				for ( var temp in data.records[i] ) {
					data.records[i][temp] = decodeURIComponent(data.records[i][temp]);
				}
			}
		}
                $scope.gridOptions.data = data.records;
				$scope.resData = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }
	
	$scope.executeSemi = function(data3){
		$state.go('semi-executed-manual', { data: data3 });
	}

    $scope.executeReq= function (data2) {
		
		$state.go('request-executed', { data: data2 });
		
		/*
        if (confirm('Are you sure want to executed ?')) {
            var data = { id : data.id, status:'T' };
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/updateRequest.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
		*/
    }

	
	$scope.formCancel = function(data){
        $scope.idC = data.id;
        $("#myModal").modal('show');
	}
    $scope.deleteReq = function () {
        if (confirm('Are you sure want to cancelled it ?')) {
            var data = { id : $scope.idC , status:'C', note2 :$scope.note2};
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/updateRequest.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    $scope.getListData();
					$("#myModal").modal('hide'); 
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
		
    }
    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]); 

app.controller('masterMyBankLimitCtrl', ['$state', '$scope', '$http', '$timeout', function ($state, $scope, $http, $timeout) {

    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function(){
        return window.innerHeight - 220;
    }

    $scope.gridOptions = {
        enableSorting: true,
	    showColumnFooter: true,
        enableColumnResizing: true,
        enableFiltering: true,
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Account No', field: 'accountno' },
            { name: 'Account Name', field: 'accountname' },
            { name: 'Bank', field: 'bankcode' },
            { name: 'Type', field: 'type' },
            { name: 'Is Active', field: 'isactive' },
			// { name: 'Opening Balance', field: 'opening', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2' },
			// { name: 'Balance', field: 'current', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
            { name: 'Daily Deposit Limit', field: 'dailydepositlimit', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
            { name: 'Current Transaction', field: 'dailydeposit', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {
        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterMyBankLimit.php",
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

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]); 

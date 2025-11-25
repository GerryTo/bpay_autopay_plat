app.controller('masterMyBankBalanceCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function(){
        return window.innerHeight - 220;
    }

    $scope.gridOptions = {
        enableSorting: true,
	    showColumnFooter: true,
        enableColumnResizing: true,
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Account No', field: 'accountno' },
            { name: 'Account Name', field: 'accountname' },
            { name: 'Bank', field: 'bankcode' },
			// { name: 'Opening Balance', field: 'opening', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2' },
			{ name: 'Balance', field: 'current', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2', 
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' 
            },
            { name: 'Daily', field: 'daily', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
            { name: 'Daily Withdrawal Limit', field: 'dailyWithdrawLimit', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
            { name: 'Daily Withdrawal', field: 'dailyWithdraw', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: 2'},
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
            url: webservicesUrl + "/getMasterMyBankBalance.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var response_data = response.data.data;
            var data = JSON.parse(response_data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.gridOptions.data = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            var response_data = response.data.data;
            var data = JSON.parse(response_data);
            console.log(data.status);
        });
    }

    // $scope.new = function () {
    //     $state.go('mybank-balance', { data: { bankAccNo: '', bankCode: '' } });
    // }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]); 

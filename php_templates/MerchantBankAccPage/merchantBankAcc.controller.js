app.controller('merchantBankAccCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    
    $scope.filter = {
        fromdate : new Date(),
        todate: new Date(),
        merchantCode: 'ALL'
    }
    $scope.merchantList = [];

    $scope.gridIsLoading = false;
	
    $scope.gridOptions = {
		showGridFooter: true,
        enableSorting: true,
        showColumnFooter: true,
        enableColumnResizing: true,
	    enableGridMenu: true,
	    exporterExcelFilename: 'merchant-bank-acc.xlsx',
	    exporterPdfMaxGridWidth: 500,
	    enableFiltering: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Alias', field: 'alias', width:100 },
            { name: 'Account No', field: 'bankAccNo', width:120 },
            { name: 'Account Name', field: 'bankAccName', width:80 },
	    	{ name: 'Bank', field: 'bankCode', width:80 },
	    	{ name: 'Login', field: 'login', width:80 },
	    	{ name: 'Type', field: 'type', width:60 },
	    	{ name: 'Active', field: 'active', width:80 },
			{ name: 'Locked', field: 'locked', width:80 },
			{ name: 'Last Used', field: 'lastused', width:120 },
			{ name: 'Agent Commission', field: 'agentCommission', width:80, cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number' },
            { name: 'Group ID', field: 'groupId', width:120 },
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };


    $scope.getMerchantList = function () {
        
        $http({
            method: "POST",
            url: webservicesUrl + "/masterMerchant_getList.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
        
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.merchantList = data.records;
                if(data.records.length > 0){
                    $scope.filter.merchantCode = data.records[0].merchantcode;
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }

    $scope.getListData = function () {
        
        var data = { 'merchant': $scope.filter.merchantCode };
        var jsonData = CRYPTO.encrypt(data);
		
        $scope.gridIsLoading = true;

        $http({
            method: "POST",
            url: webservicesUrl + "/merchantBankAcc_getList.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            timeout: 2*60*1000
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
        $scope.getMerchantList();
    }
    $scope.init();
}]); 

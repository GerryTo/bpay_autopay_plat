app.controller('transactionAccountByCompanyDepositCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal) {

    //$scope.products = [];
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
        fromdate : new Date(),
        todate: new Date(),
        accountno: '0'
    }
    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
	enableGridMenu: true,
        enableColumnResizing: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Future Trx ID', field: 'futuretrxid', aggregationType: uiGridConstants.aggregationTypes.count, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>', 
                sort:{
                    direction: uiGridConstants.DESC,
                    priority: 0
                }
            },
            { name: 'Date', field: 'timestamp', width:150   },
            { name: 'Account Src', field: 'accountno', visible:false },
            { name: 'Account Dest', field: 'accountdst' },
            { name: 'Merchant Code', field: 'merchantcode' },
            { name: 'Customer Code', field: 'customercode' },
            { name: 'CCY', field: 'ccy', visible:false },
         //   { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } },
			{ name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Debit', field: 'DB', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number',
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'IP', field: 'ip', visible:false },
            { name: 'Trans Type', field: 'transactiontype' },
            { name: 'Status', field: 'status' },
            { name: 'Account Src', field: 'accountsrc', visible:false },
            { name: 'Fee', field: 'fee', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number',
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Notes', field: 'notes' },
            { name: 'Trans ID', field: 'transactionid' },
            { name: 'Reference', field: 'reference', visible:false }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListAccount = function(){
        $http({
            method: "POST",
            url: webservicesUrl + "/getMyBank.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            //console.log(data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.acclist = data.records;
                //$scope.changeMerchant();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }
    $scope.getAccountBalance = function(){
        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var data = { 'datefrom' : from, 'accountno': $scope.filter.accountno };
        var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/getAccountOpeningBalance.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
	    $scope.Balance = {};
		console.log(data.records);
            if (data.status.toLowerCase() == 'ok') {
		$scope.Balance = data.records[0];
		$scope.Balance.opening = Number($scope.Balance.opening);
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }

    $scope.getListData = function () {
        //console.log("GetListData");
        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var arr = $scope.filter.accountno.split("||");
        var accountno = arr[0];
        var bank = arr.length > 1 ? arr[1] : '';

        var data = { 'datefrom' : from, 'dateto': to, 'accountno': accountno, 'bank': bank, 'transactiontype':'D'  };
        var jsonData = CRYPTO.encrypt(data);

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/getTransactionAccountByCompany.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
	    $scope.getAccountBalance();
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                data.records = $scope.urlDecode(data.records);
		$scope.Summary = {
                        pendingDB:0,
                        pendingCR:0,
                        DB:0,
                        CR:0,
                        fee:0
                        };
                for(var i=0, length=data.records.length;i<length;i++) {
                        if( data.records[i]['transactiontype']=='D' || data.records[i]['transactiontype']=='N' || data.records[i]['transactiontype']=='Topup' || data.records[i]['transactiontype']=='Y' || data.records[i]['transactiontype']=='I' ) {
                                data.records[i]['DB'] = data.records[i]['amount'];
                                data.records[i]['CR'] = "0";
                        } else {
                                data.records[i]['CR'] = data.records[i]['amount'];
                                data.records[i]['DB'] = "0";
                        }
/*
                        if( data.records[i]['status']=='Pending' ) {
                                $scope.Summary.pendingDB += Number(data.records[i]['DB']);
                                $scope.Summary.pendingCR += Number(data.records[i]['CR']);
                        } else if ( data.records[i]['status']=='Transaction Success' ) {
                                $scope.Summary.DB += Number(data.records[i]['DB']);
                                $scope.Summary.CR += Number(data.records[i]['CR']);
                                $scope.Summary.fee += Number(data.records[i]['fee']);
                        }
*/
			data.records[i]['fee'] = Number(data.records[i]['fee']);
                }
                $scope.gridOptions.data = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }

    $scope.adjustment = function(){
        $state.go('company-adjustment-form');
    }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        $scope.getListAccount();
        //$scope.getListData();
        
    }
    $scope.init();
}]); 

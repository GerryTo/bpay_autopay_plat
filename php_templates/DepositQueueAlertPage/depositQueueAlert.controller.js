app.controller('depositQueueAlertCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', 
    '$interval', '$rootScope', 
    function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal, $interval, $rootScope) {

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

    $scope.pagelang = {
        pagetitle :"Deposit Queue Today"
    }

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            
            { name: 'Account No', field: 'bankaccountno'},
            { name: 'Account Name', field: 'bankaccountname'},
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Pending Transaction', field: 'total', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:100,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            
            // {
            //     name: 'Action', field: 'futuretrxid', width:300,
            //     cellTemplate: '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Edit</button>'
            //         + '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>'
            //         + '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.SuccessDeposit(row.entity.futuretrxid)" ng-show="row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\' " ng-disabled="row.entity.disable ==\'1\'" >Success</button>'
            //         + '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.mutasi(row.entity)" ng-show="row.entity.status == \'Order need to check\'">Mutasi</button>'
            //         + '<button type="button" class="btn btn-info btn-sm" style="margin-right:2px;" ng-click="grid.appScope.sms(row.entity)" ng-show="row.entity.status == \'Order need to check\'">SMS</button>'
			// }
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
		if ($stateParams.data != null) {
			$scope.filter.accountno = $stateParams.data.accountno;
		}
                //$scope.changeMerchant();
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }

    $scope.getListData = function () {

        // var arr = $scope.filter.accountno.split("||");
        // var accountno = arr[0];
        // var bank = arr.length > 1 ? arr[1] : '';

        var data = { data: '' };
        var jsonData = CRYPTO.encrypt(data);

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/depositQueueAlert_getData.php",
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

    $scope.getHeight = function() {
        return window.innerHeight - 220;
    }

    $scope.init = function () {
        $scope.getListAccount();
        $scope.getListData();
    
        $rootScope.pageInterval = $interval(function(){
            if($scope.gridIsLoading == false)
                $scope.getListData();
        }, 60000);

    }
    $scope.init();
}]); 


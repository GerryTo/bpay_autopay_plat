app.controller('suspectedTransactionCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal) {

    // $scope.datepickerConfig = {
    //     formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
    //     format: 'dd-MMMM-yyyy',
    //     altInputFormats: ['M!/d!/yyyy']
    // }
    
    // $scope.dateOptions = {
    //     //dateDisabled: disabled,
    //     formatYear: 'yy',
    //     maxDate: new Date(),
    //     //minDate: new Date(),
    //     startingDay: 1
    // };
    // $scope.popup1 = {
    //     opened: false
    // };
    // $scope.open1 = function () {
    //     $scope.popup1.opened = true;
    // };
    // $scope.popup2 = {
    //     opened: false
    // };
    // $scope.open2 = function () {
    //     $scope.popup2.opened = true;
    // };

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: 'suspected-transaction.xlsx',
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
            { name: 'Bank', field: 'bankcode', sort: { direction: 'asc' }, filter: {condition: uiGridConstants.filter.EXACT } , width:100 },
            { name: 'Amount', field: 'amount', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:100 },
            { name: 'Status', field: 'status', width:120 },
            { name: 'Notes 2', field: 'notes2' , width:150},
            { name: 'Notes 3', field: 'notes3' , width:150},
            { name: 'Sms Phone', field: 'phonenumber' , width:150},
            { name: 'Sms Agent', field: 'user' , width:150},
            { name: 'Sms Matched', field: 'matchedsms' , width:150},
            { name: 'Sms Date', field: 'smsdate' , width:150},
            {
                name: 'Action', field: 'futuretrxid', width:250,
                cellTemplate: '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.process(row.entity)" >Process</button>'
			}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.process = function(data){
        if(confirm('are you sure want APPROVE and SEND BACK for this transaction?')){
            var data = { 'id' : data.futuretrxid };
            var jsonData = CRYPTO.encrypt(data);

            $http({
                method: "POST",
                url: webservicesUrl + "/suspectedTransaction_process.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Success');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }

	
    $scope.getListData = function () {

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/suspectedTransaction_getList.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
	        //$scope.getAccountBalance();
            var data = response.data;
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

    $scope.getHeight = function(){
        return window.innerHeight - 220;
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
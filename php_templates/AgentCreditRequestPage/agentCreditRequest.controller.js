app.controller('agentCreditRequestCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', 
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
            { name: 'Request ID', field: 'id', aggregationType: uiGridConstants.aggregationTypes.count, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>', 
              sort: {
                direction: uiGridConstants.DESC,
                priority: 0
               }
            },
            { name: 'Date', field: 'date', width:150  },
            { name: 'Agent', field: 'user', width:150  },
            { name: 'Account No', field: 'bankaccountno', width:150  },
            { name: 'Bank', field: 'bankcode', width:150  },
            { name: 'Amount', field: 'amount', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:100,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Status', field: 'statusdesc' , width:150},
            { name: 'Notes', field: 'note' , width:150},
            {
                name: 'Action', field: 'id', width:300,
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.approve(row.entity)" ng-show="row.entity.status == \'0\'"  >Approve</button>'
                    + '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.reject(row.entity)" ng-show="row.entity.status == \'0\'"  >Reject</button>'
			}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.approve = function(params){
        if(confirm('Are you sure want to approve this request?')){
            var params = { id : params.id };    // id : array()

            // var jsonData = CRYPTO.encrypt(params);
            $http({
                method: "POST",
                url: webservicesUrl + "/agent/cp_credit_approve.php",
                data: params,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                // var data = CRYPTO.decrypt(response.data.data);
                
                let data = response.data;
                if (data.status.toLowerCase() == 'success') {
                    alert('Approve Success!');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }

    $scope.reject = function(params){

        let reason = prompt('Reject request. Please input the reason');

        if(reason != null){
            var params = { id : params.id, reason: reason };    // id : array()

            // var jsonData = CRYPTO.encrypt(params);
            $http({
                method: "POST",
                url: webservicesUrl + "/agent/cp_credit_reject.php",
                data: params,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                // var data = CRYPTO.decrypt(response.data.data);
                let data = response.data;
                if (data.status.toLowerCase() == 'success') {
                    alert('Reject Success!');
                    $scope.getListData();
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
        
    }

	
    // $scope.getListAccount = function(){
    //     $http({
    //         method: "POST",
    //         url: webservicesUrl + "/getMyBank.php",
    //         data: { 'data': '' },
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //     }).then(function mySuccess(response) {
    //         var data = CRYPTO.decrypt(response.data.data);
    //         //console.log(data);
    //         if (data.status.toLowerCase() == 'ok') {
    //             $scope.acclist = data.records;
	// 	if ($stateParams.data != null) {
	// 		$scope.filter.accountno = $stateParams.data.accountno;
	// 	}
    //             //$scope.changeMerchant();
    //         } else {
    //             alert(data.message);
    //         }
    //     }, function myError(response) {
    //         console.log(response.status);
    //     });
    // }

    $scope.getListData = function () {
        
        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        // var arr = $scope.filter.accountno.split("||");
        // var accountno = arr[0];
        // var bank = arr.length > 1 ? arr[1] : '';

        var data = { 'from' : from, 'to': to };
        // var jsonData = CRYPTO.encrypt(data);

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/agent/cp_get_credit_request_list.php",
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            //var data = CRYPTO.decrypt(response.data.data);
            var data = response.data;
            if (data.status.toLowerCase() == 'success') {
                data.data = $scope.urlDecode(data.data);
                $scope.gridOptions.data = data.data;
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
        return window.innerHeight - 280;
    }

    $scope.init = function () {
        // $scope.getListAccount();
        $scope.getListData();
    }
    $scope.init();
}]); 


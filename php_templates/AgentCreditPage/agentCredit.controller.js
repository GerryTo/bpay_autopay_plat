app.controller('agentCreditCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal', 
    '$interval', '$rootScope', 
    function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal, $interval, $rootScope) {

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

    $scope.gridIsLoading = false;

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Agent', field: 'user', width:150  },
            { name: 'Name', field: 'name', width:150  },
            { name: 'Alias', field: 'alias', width:150  },
            { name: 'Active', field: 'isActive', width:100  },
            { name: 'Nagad', field: 'nagad', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:150,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Rocket', field: 'rocket', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:150,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            { name: 'Bkash', field: 'bkash', cellFilter: 'number: '+decimalDigit, cellClass: 'grid-alignright', type:'number', width:150,
                aggregationType: uiGridConstants.aggregationTypes.sum, footerCellTemplate: '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>' },
            {
                name: 'Action', field: 'id', width:300,
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'in\')"  >Adjust In</button>'
                    + '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.adjust(row.entity, \'out\')"  >Adjust Out</button>'
			}
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.adjust = function(dataParam, type){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'js/Modal/AgentCreditAdjustmentModal/AgentCreditAdjustmentModal.template.html?v='+new Date().getTime(),
            controller: 'agentCreditAdjustmentModalCtrl',
            size: 'lg',
            scope: $scope,
            resolve:{
                params: function(){
                    return { name: dataParam.name, user: dataParam.user, credit: 0, nagad: dataParam.nagad, rocket: dataParam.rocket, bkash: dataParam.bkash, type: type }
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            var data = { 
                username : dataParam.user,
                adjustType: type, 
                amount: returnValue.amount, 
                bankAccountNo: returnValue.bankAccountNo,
                bankCode: returnValue.bankCode
            };
                                
            // var jsonData = CRYPTO.encrypt(data);
            $http({
                method: "POST",
                url: webservicesUrl + "/agent/cp_credit_adjustment.php",
                data: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                // var data = CRYPTO.decrypt(response.data.data);
                var data = response.data;
                if (data.status.toLowerCase() == 'success') {
                    alert('Credit Adjustment Success!');
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

    
    $scope.getListData = function () {
        
        // var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        // var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        // var arr = $scope.filter.accountno.split("||");
        // var accountno = arr[0];
        // var bank = arr.length > 1 ? arr[1] : '';

        // var data = { 'from' : from, 'to': to };
        var data = {};
        // var jsonData = CRYPTO.encrypt(data);

        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/agent/cp_credit_balance.php",
            data: data,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            // var data = CRYPTO.decrypt(response.data.data);
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


app.controller('duplicateSmsCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

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
        fromdate : new Date(),
        todate: new Date(),
        type:"2",
        user:''
    }
    $scope.phoneUsers = [];
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function(){
        return window.innerHeight - 180;
    }

    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
	    enableFiltering: true,
	    enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: 'duplicate-sms.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Trx ID', field: 'trxId', width:200  },
            { name: 'Duplicate Count', field: 'duplicate', width:120  },
            {
                name: 'Action', field: 'securitycode', width:150, 
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.show(row.entity)">Show SMS</button>'
            },
        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {

        $scope.gridIsLoading = true;

        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var data = { 'datefrom' : from, 'dateto': to };
        
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/duplicateSms_getList.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            // var data = CRYPTO.decrypt(response.data.data);
            var data = response.data;
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


    $scope.show = function(dataParam){

        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'js/Modal/ShowDuplicateSmsModal/ShowDuplicateSmsModal.template.html',
            controller: 'ShowDuplicateSmsModalCtrl',
            size: 'lg',
            scope: $scope,
            resolve:{
                items: function(){
                    return { trxId: dataParam.trxId, from: from, to: to }
                }
            }
        });

        modalInstance.result.then(function (returnValue) {
            console.log("close")
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }


    $scope.init = function () {
        
    }
    $scope.init();
}]); 

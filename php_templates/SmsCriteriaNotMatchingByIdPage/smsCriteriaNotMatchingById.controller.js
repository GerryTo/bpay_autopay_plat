app.controller('smsCriterianotMatchingByIdCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

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
        trxid: '',
        history: false
    }
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
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
        exporterExcelFilename: 'sms-criteria-not-matching.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Timestamp', field: 'timestamp', width:120, aggregationType: uiGridConstants.aggregationTypes.count,
                sort:{
                    direction: uiGridConstants.DESC,
                    priority: 0
                }
            },
            { name: 'Trx ID', field: 'futuretrxid', width:120,
                cellTemplate: '<div style="padding:5px;">{{ row.entity.futuretrxid == -1 ? "Expired" : row.entity.futuretrxid }}</div>'
            },
            { name: 'Trans Phone Number', field: 'trans_phonenumber', width:120  },
            { name: 'SMS Phone Number', field: 'sms_phonenumber', width:120  },
            { name: 'Trans Amount', field: 'trans_amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number', width:120 },
            { name: 'SMS Amount', field: 'sms_amount', type: 'number', cellClass: 'grid-alignright', cellFilter: 'number: '+decimalDigit, type:'number', width:120 },
            { name: 'Suspected Reason', field: 'suspectedreason', cellTooltip: 
                function( row, col ) {
                    return row.entity.suspectedreason;
                }
            }
            // { name: 'Merchant Code', field: 'merchantcode', width:120 }
            /*{
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="false" ng-click="grid.appScope.edit(row.entity)">'+$scope.globallang.proceed+'</button>' 
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>'
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.ibft(row.entity)" ng-show="row.entity.allowresend == \'1\' ">Resend</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.id)" ng-show="row.entity.status == \'Order need to check\'">Success</button>'
                    +' <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\' || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'">Receipt</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.TimeOut(row.entity.id)" ng-show="false">Order need to check</button>' , 
                    width:260
            }*/
        ],
	onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {

        if($scope.filter.trxid == ''){
            alert('Please input trx id');
            return false;
        }

        $scope.gridIsLoading = true;

        var data = {'id': $scope.filter.trxid, 'history' : $scope.filter.history };
        console.log(data);
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/smsCriteriaNotMatchingById.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {

                for(var i=0; i<data.records.length;i++){
                    data.records[i].message = decodeURIComponent(data.records[i].message); 
                    data.records[i].from = decodeURIComponent(data.records[i].from);
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

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.init = function () {
        // $scope.getListData();
        
    }
    $scope.init();
}]); 

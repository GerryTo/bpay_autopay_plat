app.controller('smsLastAckCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

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
        type:"2"
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
        exporterExcelFilename: 'sms-log.xlsx',
        exporterExcelSheetName: 'Sheet1',
	    rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Username', field: 'username'  },
            { name: 'Phone Number', field: 'phonenumber'  },
            { name: 'Alias', field: 'alias'  },
            { name: 'Agent Name', field: 'agentname' },
            { name: 'Last Ack (BDT Time)', field: 'lastackBdt' },
            { name: 'Last Ack', field: 'lastack' },
            { name: 'Last SMS (BDT Time)', field: 'lastsmsdateBdt' },
            { name: 'Last SMS', field: 'lastsmsdate' },
            { name: 'Last SMS Content', field: 'lastsmscontent' },
            { name: 'Last SN', field: 'lastsn' },
        ],
	    onRegisterApi: function( gridApi ) {
        	$scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {
        $scope.gridIsLoading = true;

        // var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        // var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var data = { 'data' : '' };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/smsLastAck_getData.php",
            data: { 'data': jsonData },
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

app.controller('smsLastAckActiveCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

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
            { name: 'Username', field: 'username',
            cellTemplate: '<div class="ui-grid-cell-contents ng-scope ng-binding" style="background-color:hsl({{row.entity.hue}}, 89%, {{row.entity.lightness}}%)">{{row.entity.username}}</div>'
            },
            { name: 'Phone Number', field: 'phonenumber' },
            { name: 'Alias', field: 'alias'  },
            { name: 'Agent Name', field: 'agentname' },
            { name: 'Last Ack', field: 'lastack' },
            { name: 'Last SMS date', field: 'lastsmsdate' },
            { name: 'Last SMS', field: 'lastsmscontent' },
            { name: 'Last SN', field: 'lastsn' },
            { name: 'Bank Account No', field: 'bankaccno' },
            { name: 'Bank Name', field: 'bankname'},
            { name: 'Bank Active', field: 'bankactive'},
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
            url: webservicesUrl + "/smsLastAckActive_getData.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            var hue = -30
            var lightness = 70
            if (data.status.toLowerCase() == 'ok') {

                $scope.gridOptions.data = data.records;
                var username = data.records.username
                data.records.map(function(item){
                  if (username != item.username){
                    if (hue < 320){
                      hue += 40
                    }else{
                      hue = 0
                      lightness += 5
                    }
                  }
                  item.lightness = lightness
                  item.hue = hue
                  username = item.username
                })
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

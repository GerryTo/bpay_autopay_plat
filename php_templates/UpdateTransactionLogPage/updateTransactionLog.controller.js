app.controller('updateTransactionLogCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    
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

    $scope.filter = {
        fromdate : new Date(),
    }

    $scope.gridIsLoading = false;
	
    $scope.gridOptions = {
		showGridFooter: true,
        enableSorting: true,
        showColumnFooter: true,
        enableColumnResizing: true,
	    enableGridMenu: true,
	    exporterExcelFilename: 'ReportEmoney.xlsx',
	    exporterPdfMaxGridWidth: 500,
	    enableFiltering: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [

            { name: 'Timestamp', field: 'timestamp', width:150 },
            { name: 'Trans ID', field: 'notes3' },
            { name: 'Status Requested', field: 'status' },
            { name: 'Amount Requested', field: 'amount' },
            { name: 'Status', field: 'logStatus' },
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.getListData = function () {
        //console.log("GetListData");
        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';

        var data = { 'date' : from };
        var jsonData = CRYPTO.encrypt(data);
		
        $scope.gridIsLoading = true;

        $http({
            method: "POST",
            // url: webservicesUrl + "/getReportAdmin.php",
            url: webservicesUrl + "/getUpdateTransactionLog.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            timeout: 2*60*1000
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
			
            console.log(data);
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

    }
    $scope.init();
}]); 

app.controller('requestManualCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {


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

    //$scope.products = [];
    $scope.gridIsLoading = false;

    $scope.getHeight = function(){
	return window.innerHeight - 180;
     }
    $scope.gridOptions = {
        enableSorting: true,
        enableFiltering: true,
        showColumnFooter: true,
	enableGridMenu: true,
        enableColumnResizing: true,
	onRegisterApi :function(gridApi){ $scope.gridApi = gridApi; },
	rowTemplate:'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Date', field: 'date', aggregationType: uiGridConstants.aggregationTypes.count },
            { name: 'Merchant Code', field: 'merchant' },
            { name: 'Type', field: 'type' },
            { name: 'User', field: 'user' },
            { name: 'Timestamp', field: 'timestamp' },
            { name: 'Bank', field: 'bank' },
            { name: 'Bank Account', field: 'account' },
            { name: 'Account Name', field: 'accountname' },
            { name: 'Amount', field: 'amount' },
            { name: 'Status', field: 'status' },
            { name: 'Update', field: 'update' },
            { name: 'Notes', field: 'note' },
			{ name: 'Notes 2', field: 'note2' }
        ],
        data: []
    };
	$scope.typeLogin = '';

    $scope.getListData = function () {
        $scope.gridIsLoading = true;
		        var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
        var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

        var data = { 'datefrom' : from, 'dateto': to, 'accountno': $scope.filter.accountno };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/getRequestManual.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
			console.log(data);
            if (data.status.toLowerCase() == 'ok') {
                if( typeof data.records != 'undefined') {
                    for(var i=0, length=data.records.length;i<length;i++) {
                        for ( var temp in data.records[i] ) {
                            data.records[i][temp] = decodeURIComponent(data.records[i][temp]);
                        }
                    }
                }
                $scope.gridOptions.data = data.records;
                if(data.records.length > 0){
                    $scope.typeLogin = data.records[0].merchant;
                }

				if($scope.typeLogin == '')
                {
                    $scope.header = 'Setlement';		
                }
				else
                {
					$scope.header = 'Setlement & Topup';
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
        });
    }

    $scope.new = function () {
        $state.go('request-manual-form', { data:{} });
    }

    $scope.new2 = function () {
        $state.go('request-manual-form2', { data:{} });
    }

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.view = function (data) {
        $state.go('request-manual-form', { data: { subject: data.subject, timestamp:data.timestamp, id:data.id } });
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]); 

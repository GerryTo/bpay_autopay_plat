app.controller('companyAdjustmentFormCtrl', ['$state', '$scope','uiGridConstants', '$http', '$timeout', '$stateParams', function ($state, $scope,uiGridConstants, $http, $timeout, $stateParams) {

    $scope.data = {
        accountno: '',
        type: 'Y',
        amount: '',
        bankcode:'',
		 notes:'',
		 notes:'',
		 typenotes:'1',
		 datenotes:'',
		 subnotes:'U/O',
		 notes2:'',		 
    }

    $scope.acclist = [];
	$scope.visible = 1;
	$scope.dDate = 1;
	
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

	    $scope.acclist = [];
	
    $scope.filter = {
        fromdate : new Date(),
        todate: new Date(),
        accountno: '0'
    }
	
	
	
	$scope.checkNotes = function(Item){
	
		if(Item == '1')
			{
				$scope.visible = 2;
				$scope.data.typenotes='2';
				//$scope.popup1.opened = true;
			
				
			}
		else{
						$scope.visible = 1;
				$scope.data.typenotes='1';
					
		}		
		
		
	}	
	

    /*$scope.loadData = function () {
        if ($scope.data.merchantCode == '') return false;
        var data = { merchantcode: $scope.data.merchantCode };
        var jsonData = CRYPTO.encrypt(data);

        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterMerchantDetail.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.data = data.records[0];
                console.log(data.records[0]);
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }*/

    $scope.save = function () {
        $scope.data.datenotes = $scope.filter.fromdate;
        
        var tmp = JSON.parse(JSON.stringify($scope.data));
        //var arr = tmp.accountno.split("||");
        //tmp.accountno = arr[0];

        var jsonData = CRYPTO.encrypt(tmp);


        $http({
            method: "POST",
            url: webservicesUrl + "/saveCompanyAdjustment.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                alert('Data Saved');
                $state.go('transaction-account-by-company');
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.cancel = function () {
        $state.go('transaction-account-by-company');
    }

    $scope.changeAccount = function(){

        var arr = $scope.data.accountno.split("||");
        $scope.data.bankcode = arr[1];

        /*for(var i =0;i< $scope.acclist.length;i++){
            if($scope.acclist[i].bankaccountno == arr[0] && $scope.acclist[i].bankcode == arr[1]){
                $scope.data.bankcode = $scope.acclist[i].bankcode;
                break;
            }
        }*/
    }
    

    //-------GET OTHER MASTER------------------
    $scope.getMyBank = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getActiveMyBank.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.acclist = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    
    $scope.validateNumberOnly = function (event) {
        if ((event.keyCode >= 48 && event.keyCode <= 57)
            || (event.keyCode >= 96 && event.keyCode <= 105)
            || event.keyCode == 8 || event.keyCode == 190) {
            // 0-9 only
            //console.log(event.keyCode);
        } else {
            event.preventDefault();
        }
    }

    $scope.init = function () {

        $scope.getMyBank();
        //$scope.loadData();
    }
    $scope.init();
}]); 

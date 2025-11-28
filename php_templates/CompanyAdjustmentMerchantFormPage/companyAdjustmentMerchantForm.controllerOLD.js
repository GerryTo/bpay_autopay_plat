app.controller('companyAdjustmentMerhcantFormCtrl', ['$state', '$scope','uiGridConstants', '$http', '$timeout', '$stateParams', function ($state, $scope,uiGridConstants, $http, $timeout, $stateParams) {
		
    $scope.datepickerConfig = {
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
        format: 'dd-MMMM-yyyy',
        altInputFormats: ['M!/d!/yyyy']
    }		
		
	
    $scope.data = {
        accountno: '',
        type: 'Y',
        amount: '',
        bankcode:'',
		 notes:'',
		 typenotes:'1',
		 datenotes:'',
		 subnotes:'U/O',
		 notes2:'',
		 merchantCode:'',
		 merchantaccountno :'',
    }

    $scope.acclist = [];
	$scope.merchantList =[];
	$scope.merchantbank = [];
	$scope.visible = 1;
	$scope.dDate = 1;
	$scope.checkNotes = function(Item){
		

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

	
		if(Item == '1')
			{
				$scope.visible = 2;
				$scope.data.typenotes='2';
				//$scope.popup1.opened = true;
				$scope.open1();
				
			}
		else{
						$scope.visible = 1;
				$scope.data.typenotes='1';
					$scope.open1();
		}		
		
		
	}
	
	$scope.getMerchantCode = function () {
		
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterMerchant.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.merchantList = data.records;
				console.log($scope.merchantList);
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
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
			
			//alert($scope.data.datenotes);
        var jsonData = CRYPTO.encrypt($scope.data);

        $http({
            method: "POST",
            url: webservicesUrl + "/saveCompanyAdjustmentMerchant.php",
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

    $scope.changeMerchant = function (Item) {
		
		var jsonData = CRYPTO.encrypt($scope.data);
        //alert(jsonData);
		$http({
            method: "POST",
            url: webservicesUrl + "/getMasterBankMerchant.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
			console.log(data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.merchantBank = data.records;
				console.log($scope.merchantBank);
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
	
    $scope.changeAccount = function(){
        for(var i =0;i< $scope.acclist.length;i++){
            if($scope.acclist[i].bankaccountno == $scope.data.accountno){
                $scope.data.bankcode = $scope.acclist[i].bankcode;
                break;
            }
        }
    }
    

    //-------GET OTHER MASTER------------------
    $scope.getMyBank = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMyBank.php",
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
		$scope.getMerchantCode();
        //$scope.loadData();
		
    }
    $scope.init();
}]); 

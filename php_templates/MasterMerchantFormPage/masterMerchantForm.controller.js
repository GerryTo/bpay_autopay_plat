app.controller('masterMerchantFormCtrl', ['$state', '$scope', '$http', '$timeout', '$stateParams', function ($state, $scope, $http, $timeout, $stateParams) {

    $scope.data = {
        merchantCode: '',
        merchantName: '',
        mobileNumber: '',
        email: '',
        website: '',
        secureCode: '',
        countryCode: '',
        currencyCode: '',
        openingBalance: 0,
        withdrawFeeType: 'P',
        withdrawFeeValue: 0,
        depositFeeType: 'P',
        depositFeeValue: 0,
        customerDepositFeeType: 'P',
        customerDepositFeeValue: 0,
        customerWithdrawFeeType: 'P',
        customerWithdrawFeeValue: 0,
		minimumWithdraw:0,
		resellerid:'',
        resellerFeeType: 'P',
        resellerFeeValue: 0,		
        merchantBank: [],
        timezone: 8,
    }
    $scope.isEdit = false;

    $scope.detail = {
        id: 0,
        bankAccNo: '',
        bankAccName: '',
        bankCode: ''
    }
	$scope.resellerList = [];
    $scope.country = [];
    $scope.currency = [];
    $scope.bank = [];
    

    $scope.loadData = function () {
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

                $scope.data.timezone = parseInt($scope.data.timezone);
                
                $scope.data.resellerFeeValue = Number($scope.data.resellerFeeValue);
                $scope.data.minimumWithdraw = Number($scope.data.minimumWithdraw);
		
				$scope.data.withdrawFeeValue = Number($scope.data.withdrawFeeValue);
		        $scope.data.depositFeeValue = Number($scope.data.depositFeeValue);
		
				$scope.data.customerWithdrawFeeValue = Number($scope.data.customerWithdrawFeeValue);
		        $scope.data.customerDepositFeeValue = Number($scope.data.customerDepositFeeValue);		
		
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.addDetail = function () {
        if ($scope.detail.bankAccNo == '') {
            alert('Please input Bank Acc. No');
            return false;
        }
        if ($scope.detail.bankAccName == '') {
            alert('Please input Bank Acc. Name');
            return false;
        }
        if ($scope.detail.bankCode == '') {
            alert('Please pick bank');
            return false;
        }
        var isDuplicate = false;
        for( var i =0; i<$scope.data.merchantBank.length;i++ ) {
            if( $scope.data.merchantBank[i].bankAccNo == $scope.detail.bankAccNo 
                && $scope.data.merchantBank[i].bankCode == $scope.detail.bankCode) {
                isDuplicate=true;
                break;
            }
        }
        if( isDuplicate )  {
            alert('Duplicate Account Number');
            return false;
        }

        var item = {
            idx: $scope.data.merchantBank.length,
            id: $scope.detail.id,
            bankAccNo: $scope.detail.bankAccNo,
            bankAccName: $scope.detail.bankAccName,
            bankCode: $scope.detail.bankCode
        }
        $scope.data.merchantBank.push(item);
        $scope.detail.id = 0;
        $scope.detail.bankAccNo = '';
        $scope.detail.bankAccName = '';
        $scope.detail.bankCode = '';
    }
    $scope.removeDetail = function (item) {
        $scope.data.merchantBank.splice(item.idx, 1);
    }

    $scope.save = function () {

        var jsonData = CRYPTO.encrypt($scope.data);

        $http({
            method: "POST",
            url: webservicesUrl + "/saveMasterMerchant.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                alert('Data Saved');
                $state.go('master-merchant');
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.cancel = function () {
        $state.go('master-merchant');
    }

	
	//--------------------------GET ID type -----------------
    $scope.getMasterReseller = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterBank2.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.resellerList = data.records;

            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
	
    //-------GET OTHER MASTER------------------
    $scope.getMasterCountry = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterCountry.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.country = data.records;
                if ($scope.country.length > 0) {
                    $scope.data.countryCode = $scope.country[0].countryCode;
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    $scope.getMasterCurrency = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterCurrency.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.currency = data.records;
                if ($scope.currency.length > 0) {
                    $scope.data.currencyCode = $scope.currency[0].currencyCode;
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    $scope.getMasterBank = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterBank.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.bank = data.records;
                if ($scope.bank.length > 0) {
                    $scope.detail.bankCode = $scope.bank[0].bankCode;
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    

    $scope.validateNumberOnly = function (event) {
        console.log(event.keyCode);
    }

    $scope.init = function () {
        if ($stateParams.data != null) {
            $scope.data.merchantCode = $stateParams.data.merchantcode;
            if($stateParams.data.merchantcode == '')
                $scope.isEdit = false;
            else
                $scope.isEdit = true;
        } else {

            $state.go('master-merchant');
        }

        $scope.getMasterCountry();
        $scope.getMasterCurrency();
        $scope.getMasterBank();
		$scope.getMasterReseller();
        
        $scope.loadData();
    }
    $scope.init();
}]); 

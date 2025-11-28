app.controller('companyAdjustmentFormCtrl', ['$state', '$scope', '$http', '$timeout', '$stateParams', function ($state, $scope, $http, $timeout, $stateParams) {

    $scope.data = {
        accountno: '',
        type: 'Y',
        amount: '',
        bankcode:'',
		 notes:''
    }

    $scope.acclist = [];

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

        var jsonData = CRYPTO.encrypt($scope.data);

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
        //$scope.loadData();
    }
    $scope.init();
}]); 

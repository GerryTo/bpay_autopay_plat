app.controller('agentGroupFormCtrl', ['$state', '$scope', '$http', '$timeout', '$stateParams', function ($state, $scope, $http, $timeout, $stateParams) {

    $scope.data = {
		id: 0,
        name: '',
        status: "Yes"
    };
    $scope.edit = { mode:false };

    // $scope.loadData = function () {
    //     if ($scope.data.merchantCode == '') return false;
    //     var data = { bankAccNo: $stateParams.data.bankAccNo, bankCode: $stateParams.data.bankCode };
    //     var jsonData = CRYPTO.encrypt(data);
    //     $http({
    //         method: "POST",
    //         url: webservicesUrl + "/getMasterMyBank.php",
    //         data: { 'data': jsonData },
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //     }).then(function mySuccess(response) {
            
    //         var data = CRYPTO.decrypt(response.data.data);
    //         console.log(data);
    //         if (data.status.toLowerCase() == 'ok') {
	// 			data.records =$scope.urlDecode(data.records);
	// 			if(data.records.length > 0){
    //                 data.records[0].dailywithdrawallimit = Number(data.records[0].dailywithdrawallimit);
    //                 data.records[0].dailylimit = Number(data.records[0].dailylimit);
    //                 data.records[0].dailydepositlimit = Number(data.records[0].dailydepositlimit);
    //                 data.records[0].minDeposit = Number(data.records[0].minDeposit);
    //                 data.records[0].maxDeposit = Number(data.records[0].maxDeposit);
    //                 data.records[0].agentCommission = Number(data.records[0].agentCommission);
    //                 $scope.data = $scope.urlDecode(data.records[0]);

    //                 console.log($scope.data);
    //             }
	// 	        if( typeof(data.records[0].balance)!="undefined" )  {
	// 		        $scope.data.balance = Number(data.records[0].balance);
	// 	        }
    //         } else {
    //             alert(data.message);
    //         }
    //     }, function myError(response) {
    //         console.log(response);
    //     });
    // }
    
    $scope.save = function () {

		if ($scope.data.name == '') {
            alert('Please input group name');
            return false;
        }

        var tmp = JSON.parse(JSON.stringify($scope.data));

        tmp.status = tmp.status == 'Yes' ? 1 : 0;

        // var jsonData = CRYPTO.encrypt(tmp);

        $http({
            method: "POST",
            url: webservicesUrl + "/agentgroup/save.php",
            data: tmp,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            // var data = CRYPTO.decrypt(response.data.data);
            response = response.data;
            if (response.status.toLowerCase() == 'success') {
                alert('Data Saved');
                $state.go('agentgroup');
            } else {
                alert(response.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.cancel = function () {
        $state.go('agentgroup');
    }

    $scope.init = function () {

        if ($stateParams.data != null) {
            $scope.data.id = $stateParams.data.id;
            $scope.data.name= $stateParams.data.name;
	        $scope.data.status=$stateParams.data.active;
        } else {
            $state.go('agentgroup');
        }

        console.log($scope.data);

        // $scope.loadData();
    }
    $scope.init();
}]); 

app.controller('phoneWhitelistFormCtrl', ['$state', '$scope', '$http', '$timeout', '$stateParams', function ($state, $scope, $http, $timeout, $stateParams) {

    $scope.data = {
		id: null,
        phoneNumber: '',
        description: '',
        isActive: 'Y'

    };
    $scope.edit = {mode:false};

    $scope.loadData = function () {
        if ($scope.data.id == null || $scope.data.id == 0) return false;
        var data = { id: $stateParams.data.id };
        var jsonData = CRYPTO.encrypt(data);
        $http({
            method: "POST",
            url: webservicesUrl + "/phoneWhitelistForm_getData.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
				data.records =$scope.urlDecode(data.records);
				if(data.records.length > 0){
                    $scope.data = $scope.urlDecode(data.records[0]);
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    
    $scope.save = function () {

		if ($scope.data.phoneNumber == '') {
            alert('Please input Phone number');
            return false;
        }

        var tmp = $scope.data
        var jsonData = CRYPTO.encrypt(tmp);

        $http({
            method: "POST",
            url: webservicesUrl + "/phoneWhitelistForm_saveData.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                alert('Data Saved');
                $state.go('phone-whitelist');
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.cancel = function () {
        $state.go('phone-whitelist');
    }

    $scope.init = function () {

        if ($stateParams.data != null) {
            $scope.data.id = $stateParams.data.id;
            $scope.data.phoneNumber= $stateParams.data.phoneNumber;
	        $scope.data.description=$stateParams.data.description;
	        $scope.data.isActive = $stateParams.data.isActive;
        } else {
            $state.go('phone-whitelist');
        }

        $scope.loadData();
		if( $stateParams.data.id != null ) {
			$scope.edit.mode=true;
		}
    }
    $scope.init();
}]); 

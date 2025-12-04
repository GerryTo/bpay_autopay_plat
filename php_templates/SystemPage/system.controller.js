app.controller('systemCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants','$uibModal', '$interval', function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal, $interval ) {

    $scope.settingList = [];
    $scope.isloading = false;

    $scope.getSystem = function () {

        $http({
            method: "POST",
            url: webservicesUrl + "/system_getSetting.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {

            var data = response.data;
            if (data.status.toLowerCase() == 'ok') {

               $scope.settingList = data.data;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.save = function(){
        console.log($scope.settingList);

        $scope.isloading = true;

        var jsonData = CRYPTO.encrypt($scope.settingList);

        $http({
            method: "POST",
            url: webservicesUrl + "/system_saveSetting.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = response.data;
            if (data.status.toLowerCase() == 'ok') {
               alert('System Setting Saved');
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }

    $scope.init = function () {
        $scope.getSystem();
        
    }
    $scope.init();
}]); 

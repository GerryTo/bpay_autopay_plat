app.controller('updateGroupCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    $scope.filter = {
        date : '',
        bank: '',
        group: '1'
    }
    $scope.accountList = [];
    $scope.dateList = [];

    $scope.getAccountList = function () {
        
        $http({
            method: "POST",
            url: webservicesUrl + "/getMyBank.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
        
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.accountList = data.records;
                if(data.records.length > 0){
                    $scope.filter.bank = data.records[0].bankaccountno+" - "+data.records[0].bankcode;
                }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response.status);
        });
    }

  $scope.getDateList = function () {
        
      $http({
          method: "POST",
          url: webservicesUrl + "/getAvailableAccountDate.php",
          data: { 'data': '' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
      
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == 'ok') {
              $scope.dateList = data.records;
              if(data.records.length > 0){
                  $scope.filter.date = data.records[0].date;
              }
          } else {
              alert(data.message);
          }
      }, function myError(response) {
          console.log(response.status);
      });
  }

  $scope.submit = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/updateGroup.php",
        data: { 'data': $scope.filter },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    }).then(function mySuccess(response) {
        // console.log(response)
        var data = response.data
            alert(data.message);
            // console.log(data)
    }, function myError(response) {
      alert(0)
        console.log(response.status);
    });
  }

    $scope.init = function () {
        $scope.getDateList();
        $scope.getAccountList();
    }
    $scope.init();
}]); 

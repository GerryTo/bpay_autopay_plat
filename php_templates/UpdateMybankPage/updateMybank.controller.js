app.controller('updateMybankCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

  $scope.filter = {
      type: 'A',
      bank: 'ALL',
      merchant : 'ALL',
      status: 'Y',
      merchantStatus: '0'
  }
  $scope.merchantList = [];
  $scope.bankList = []

  $scope.getBankList = function () {
      
      $http({
          method: "POST",
          url: webservicesUrl + "/getMasterBank.php",
          data: { 'data': '' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
      
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == 'ok') {
              $scope.bankList = data.records;
              // if(data.records.length > 0){
              //     $scope.filter.bank = data.records[0].bankCode;
              // }
          } else {
              alert(data.message);
          }
      }, function myError(response) {
          console.log(response.status);
      });
  }

  $scope.getMerchantList = function () {
      
    $http({
        method: "POST",
        url: webservicesUrl + "/getMasterMerchantList.php",
        data: { 'data': '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    }).then(function mySuccess(response) {
    
        var data = CRYPTO.decrypt(response.data.data);
        if (data.status.toLowerCase() == 'ok') {
            $scope.merchantList = data.records;
            if(data.records.length > 0){
                $scope.filter.merchant = data.records[0].merchantCode;
            }
        } else {
            alert(data.message);
        }
    }, function myError(response) {
        console.log(response.status);
    });
}

$scope.submitStatus = function () {
  if(confirm("Are you sure?") == true){
    $http({
      method: "POST",
      url: webservicesUrl + "/updateMybank.php",
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
}

$scope.submitMerchant = function () {
  if(confirm("Are you sure?") == true){
    $http({
      method: "POST",
      url: webservicesUrl + "/updateMybankMerchant.php",
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
}

$scope.tabHandle = function (data) {
  switch(data){
    case 0:
      $scope.filter.merchant = 'ALL'
      break;
    case 1:
      $scope.getMerchantList()
      break;
  }
}

$scope.submitType = function () {
  if(confirm("Are you sure?") == true){
    $http({
      method: "POST",
      url: webservicesUrl + "/updateMybankType.php",
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
}

  $scope.init = function () {
      $scope.getBankList()
      // $scope.getMerchantList()
  }
  $scope.init();
}]); 

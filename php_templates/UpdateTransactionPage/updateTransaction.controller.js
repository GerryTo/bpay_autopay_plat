app.controller('updateTransactionCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {

    $scope.filter = {
       status: "0",
       notes3: "",
       chgAmt: false,
       chgChk: false,
       amount: "",
       pass : ""
    }

    $scope.chgAmtHandle = function () {
      $scope.filter.amount = ""
    }

    $scope.chgChkHandle = function () {
      $scope.filter.status = ""
    }

    $scope.chgStsHandle = function () {
      if($scope.filter.status == "1"){
        $scope.filter.chgAmt = false
        $scope.chgAmtHandle()
      }
      console.log($scope.filter.chgAmt)
    }


    $scope.submit = function () {
      if($scope.filter.notes3 != "" && $scope.filter.notes3 != null){
        $scope.gridIsLoading = true;
         
        if(confirm("Are you sure want to update "+$scope.filter.notes3+" ?") == true){
          // $scope.filter.pass = prompt("Input Password : ")
          var jsonData = CRYPTO.encrypt($scope.filter);
          $http({
            method: "POST",
            url: webservicesUrl + "/updateTransactionStatus.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
          }).then(function mySuccess(response) {
              $scope.gridIsLoading = false;
              var data = CRYPTO.decrypt(response.data.data);
                  alert(data.message);
                  // console.log(data)
          }, function myError(response) {
            $scope.gridIsLoading = false;
            alert(0)
              console.log(response.status);
          });
        }
        else{
          $scope.gridIsLoading = false;
        }
      }else{
        alert("Please Input Transaction ID")
      }
      
    }

    $scope.init = function () {

    }
    $scope.init();
}]); 

app.controller('reportMerchantCtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', function ($state, $scope, $http, $timeout, uiGridConstants) {
    
  $scope.filter = {
    report : 'Deposit',
    merchantCode: 'ALL',
    category : 'daily'
  }

  $scope.merchantList = [];

  $scope.categoryList = [
    {category:'daily', name:'Daily'}, 
    {category:'weekly', name:"Weekly"}, 
    {category:'monthly', name:"Monthly"}
  ]

  $scope.reportList = [
    {report:'Deposit', name:'Deposit'}, 
    {report:'Withdraw', name:"Withdraw"}, 
    {report:'Adjustment', name:"Adjustment"},
    {report:'Adjustment_Deposit', name:"Adjustment Deposit"},
    {report:'Adjustment_Withdraw', name:"Adjustment Withdraw"},
    {report:'Deposit_byComplete', name:'Deposit By Complete'}, 
    {report:'Withdraw_byComplete', name:"Withdraw By Complete"}, 
    {report:'Adjustment_byComplete', name:"Adjustment By Complete"},
    {report:'Adjustment_Deposit_byComplete', name:"Adjustment Deposit By Complete"},
    {report:'Adjustment_Withdraw_byComplete', name:"Adjustment Withdraw By Complete"},
    {report:'Deposit_gmt+8', name:'Deposit GMT+8'}, 
    {report:'Withdraw_gmt+8', name:"Withdraw GMT+8"}, 
    {report:'Adjustment_gmt+8', name:"Adjustment GMT+8"},
    {report:'Adjustment_Deposit_gmt+8', name:"Adjustment Deposit GMT+8"},
    {report:'Adjustment_Withdraw_gmt+8', name:"Adjustment Withdraw GMT+8"},
    {report:'Deposit_byComplete_gmt+8', name:'Deposit By Complete GMT+8'}, 
    {report:'Withdraw_byComplete_gmt+8', name:"Withdraw By Complete GMT+8"}, 
    {report:'Adjustment_byComplete_gmt+8', name:"Adjustment By Complete GMT+8"},
    {report:'Adjustment_Deposit_byComplete_gmt+8', name:"Adjustment Deposit By Complete GMT+8"},
    {report:'Adjustment_Withdraw_byComplete_gmt+8', name:"Adjustment Withdraw By Complete GMT+8"},
  ]

  $scope.gridIsLoading = false;
	
    $scope.gridOptions = {
		// showGridFooter: true,
      enableColumnMenus: false,
        enableSorting: true,
        // showColumnFooter: true,
        // enableColumnResizing: true,
	    // enableGridMenu: true,
	    // exporterExcelFilename: 'ReportEmoney.xlsx',
	    // exporterPdfMaxGridWidth: 500,
	    enableFiltering: true,
        // rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [

            { name: 'File Name', field: 'filename' },
            { name: 'link', field: 'link', width:130,
              cellTemplate: '<a type="button" class="btn btn-primary btn-sm" href="{{row.entity.link}}">Download</a>'
            }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

  $scope.getMerchantList = function () {
        
    $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getList.php",
        data: { 'data': '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    }).then(function mySuccess(response) {
    
        var data = CRYPTO.decrypt(response.data.data);
        if (data.status.toLowerCase() == 'ok') {
            $scope.merchantList = data.records;
            if(data.records.length > 0){
                $scope.filter.merchantCode = data.records[0].merchantcode;
            }
        } else {
            alert(data.message);
        }
    }, function myError(response) {
        console.log(response.status);
    });
  }

  $scope.getListData = function () {
      //console.log("GetListData");

      var data = { 'report' : $scope.filter.report, 'category': $scope.filter.category, 'merchantCode': $scope.filter.merchantCode };
      var jsonData = CRYPTO.encrypt(data);

      $scope.gridIsLoading = true;

      $http({
          method: "POST",
          url: webservicesUrl + "/report_merchant_getFiles.php",
          data: { 'data': jsonData },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          timeout: 2*60*1000
      }).then(function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
    
          // console.log(data);
          if (data.status.toLowerCase() == 'success') {
              data.records = $scope.urlDecode(data.records);
              
              $scope.gridOptions.data = data.records;
          } else {
              alert(data.message);
          }
    
      }, function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.status);
      });
  }

  $scope.init = function () {
      $scope.getMerchantList();
  }
  $scope.refresh = function (){
      $scope.getListData();
  }
  $scope.init();
}]); 

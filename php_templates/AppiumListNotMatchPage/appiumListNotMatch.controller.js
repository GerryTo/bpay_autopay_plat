app.controller("appiumListNotMatchCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$uibModal",
  "$interval",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $uibModal,
    $interval
  ) {
    //----datepicker----

    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      //minDate: new Date(),
      startingDay: 1,
    };
    $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };
    $scope.popup2 = {
      opened: false,
    };
    $scope.open2 = function () {
      $scope.popup2.opened = true;
    };
    $scope.filter = {
      fromdate: new Date(),
      todate: new Date(),
      type: "2",
      user: "",
      history: false,
    };
    $scope.phoneUsers = [];
    //------------------

    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "appium-list.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Date",
          field: "date",
          width: 120,
          aggregationType: uiGridConstants.aggregationTypes.count,
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        // { name: "Title", field: "title", width: 200 },
        { name: "Account", field: "dst_account_name", width: 150 },
        { name: "Phone Number", field: "dst_bank_account_no", width: 150 },
        { name: "Bank Code", field: "bankcode", width: 150 },
        // { name: "Account", field: "account", width: 150 },
        { name: "Trx ID", field: "trxid", width: 150 },
        {
          name: "Amount",
          field: "amount",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
          width: 150,
        },
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          width: 200,
          cellTemplate:
            '<div style="padding:5px;">{{ row.entity.futuretrxid == -1 ? "Expired" : row.entity.futuretrxid }}</div>',
        },
        { name: "Status", field: "status", width: 150 },
        { name: "Memo", field: "memo", width: 500 },
        /*{
                name: 'Action', field: 'merchantcode',
                cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-show="false" ng-click="grid.appScope.edit(row.entity)">'+$scope.globallang.proceed+'</button>' 
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.check(row.entity.id)" ng-show="row.entity.status == \'Pending\'"  >Check</button>'
                    +' <button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.cancel(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Fail</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.ibft(row.entity)" ng-show="row.entity.allowresend == \'1\' ">Resend</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.SuccessWithUploadReceipt(row.entity.id)" ng-show="row.entity.status == \'Order need to check\'">Success</button>'
                    +' <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.receipt(row.entity)" ng-show="row.entity.status == \'Transaction Success\' || row.entity.status == \'Transaction Failed\' || row.entity.status == \'Order need to check\' || row.entity.status == \'Resend 0\' || row.entity.status == \'Resend 1\'">Receipt</button>'
                    +' <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.TimeOut(row.entity.id)" ng-show="false">Order need to check</button>' , 
                    width:260
            }*/
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = { datefrom: from, dateto: to, history: $scope.filter.history };

      var jsonData = data;

      $http({
        method: "POST",
        url: webservicesUrl + "/appiumList_getListNotMatch.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          // var data = CRYPTO.decrypt(response.data.data);
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
            // for(var i=0; i<data.records.length;i++){
            //     data.records[i].message = decodeURIComponent(data.records[i].message);
            //     data.records[i].from = decodeURIComponent(data.records[i].from);
            // }

            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.status);
        }
      );
    };

    // $scope.getPhoneUserList = function(){

    //     var data = { 'data' : '' };

    //     var jsonData = data;

    //     $http({
    //         method: "POST",
    //         url: webservicesUrl + "/smsLog_getPhoneUserList.php",
    //         data: { 'data': jsonData },
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //     }).then(function mySuccess(response) {
    //         $scope.gridIsLoading = false;
    //         // var data = CRYPTO.decrypt(response.data.data);
    //         var response_data = response.data.data;
    //         var data = JSON.parse(response_data);
    //         if (data.status.toLowerCase() == 'ok') {
    //             $scope.phoneUsers = data.records;
    //         } else {
    //             alert(data.message);
    //         }
    //     }, function myError(response) {
    //         $scope.gridIsLoading = false;
    //         console.log(response.status);
    //     });
    // }

    // $scope.expire = function(dataParam){
    //     if(confirm('Are you sure want to expire this SMS?')){
    //         var data = {
    //             amount: dataParam.amount,
    //             bank: dataParam.type,
    //             trxid: dataParam.securitycode,
    //             phonenumber: dataParam.customerphone
    //         };

    //         var jsonData = CRYPTO.encrypt(data);
    //         $http({
    //             method: "POST",
    //             url: webservicesUrl + "/smsLog_expireSms.php",
    //             data: { 'data': jsonData },
    //             headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //         }).then(function mySuccess(response) {
    //             var data = CRYPTO.decrypt(response.data.data);
    //             if (data.status.toLowerCase() == 'ok') {
    //                 alert('Success!');
    //                 $scope.getListData();
    //             } else {
    //                 alert(data.message);
    //             }
    //         }, function myError(response) {
    //             console.log(response);
    //         });
    //     }
    // }

    // $scope.match = function(dataParam){
    //     var modalInstance = $uibModal.open({
    //         animation: true,
    //         templateUrl: 'js/Modal/TransactionSuggestionModal/TransactionSuggestionModal.template.html',
    //         controller: 'TransactionSuggestionModalCtrl',
    //         size: 'lg',
    //         scope: $scope,
    //         resolve:{
    //             items: function(){
    //                 return { amount: dataParam.amount, bank: dataParam.type, trxid: dataParam.securitycode, phonenumber: dataParam.customerphone }
    //             }
    //         }
    //     });

    //     modalInstance.result.then(function (returnValue) {
    //         var data = {
    //             futuretrxid : returnValue.futuretrxid,
    //             amount: dataParam.amount,
    //             bank: dataParam.type,
    //             trxid: dataParam.securitycode,
    //             phonenumber: dataParam.customerphone
    //         };

    //         console.log(data);

    //         var jsonData = CRYPTO.encrypt(data);
    //         $http({
    //             method: "POST",
    //             url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
    //             data: { 'data': jsonData },
    //             headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
    //         }).then(function mySuccess(response) {
    //             var data = CRYPTO.decrypt(response.data.data);
    //             if (data.status.toLowerCase() == 'ok') {
    //                 alert('Success!');
    //                 $scope.getListData();
    //             } else {
    //                 alert(data.message);
    //             }
    //         }, function myError(response) {
    //             console.log(response);
    //         });

    //     }, function () {
    //         console.log('Modal dismissed at: ' + new Date());
    //     });
    // }

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      // $scope.getListData();
    };
    $scope.init();
  },
]);

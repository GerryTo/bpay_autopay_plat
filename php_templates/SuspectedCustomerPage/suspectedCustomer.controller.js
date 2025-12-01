app.controller("suspectedCustomerCtrl", [
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
      exporterExcelFilename: "suspected-customer.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        // {
        //   name: "Timestamp",
        //   field: "timestamp",
        //   width: 220,
        //   aggregationType: uiGridConstants.aggregationTypes.count,
        //   sort: {
        //     direction: uiGridConstants.DESC,
        //     priority: 0,
        //   },
        // },
        { name: "Customer Phone", field: "customerPhone" },
        { name: "Total SMS", field: "totalCount", width: 120 },
        // { name: "Phone Number", field: "phonenumber", width: 120 },
        // { name: "Bank", field: "type", width: 120 },
        // { name: "Trx ID", field: "securitycode", width: 120 },
        // { name: "Customer Phone", field: "customerphone", width: 120 },
        // { name: "Service Center", field: "servicecenter", width: 120 },
        {
          name: "Total Amount",
          field: "totalAmount",
          type: "number",
          cellClass: "grid-alignright",
          cellFilter: "number: " + decimalDigit,
          type: "number",
          width: 120,
        },
        // { name: "Message", field: "message" },
        {
          name: "Is Checked",
          field: "isChecked",
          width: 120,
          cellTemplate:
            '<div style="padding:5px;">{{ row.entity.isChecked == 0 ? "Not Checked" : "Checked" }}</div>',
        },
        // {
        //   name: "Balance",
        //   field: "balance",
        //   type: "number",
        //   cellClass: "grid-alignright",
        //   cellFilter: "number: " + decimalDigit,
        //   type: "number",
        //   width: 120,
        // },
        // {
        //   name: "Balance Calculated",
        //   field: "balancecalculate",
        //   type: "number",
        //   cellClass: "grid-alignright",
        //   cellFilter: "number: " + decimalDigit,
        //   type: "number",
        //   width: 120,
        // },
        // {
        //   name: "Balance Different",
        //   field: "balancediff",
        //   type: "number",
        //   cellClass: "grid-alignright",
        //   cellFilter: "number: " + decimalDigit,
        //   type: "number",
        //   width: 120,
        // },
        // {
        //   name: "Reason",
        //   field: "reason",
        //   width: 150,
        //   cellTooltip: function (row, col) {
        //     return row.entity.reason;
        //   },
        // },
        {
          name: "Action",
          field: "customerPhone",
          width: 150,
          cellTemplate:
            '<button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.show(row.entity)">Show</button> <button type="button" class="btn btn-primary btn-sm" ng-show="row.entity.isChecked == 0" ng-click="grid.appScope.checked(row.entity)">Checked</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      //   var from = $scope.convertJsDateToString($scope.filter.fromdate);
      //   var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = {};

      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/suspectedCustomer_getList.php",
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

    // $scope.getPhoneUserList = function () {
    //   var data = { data: "" };

    //   var jsonData = CRYPTO.encrypt(data);

    //   $http({
    //     method: "POST",
    //     url: webservicesUrl + "/smsLog_getPhoneUserList.php",
    //     data: { data: jsonData },
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //     },
    //   }).then(
    //     function mySuccess(response) {
    //       $scope.gridIsLoading = false;
    //       // var data = CRYPTO.decrypt(response.data.data);
    //       var data = response.data;
    //       if (data.status.toLowerCase() == "ok") {
    //         $scope.phoneUsers = data.records;
    //       } else {
    //         alert(data.message);
    //       }
    //     },
    //     function myError(response) {
    //       $scope.gridIsLoading = false;
    //       console.log(response.status);
    //     }
    //   );
    // };

    // $scope.expire = function (dataParam) {
    //   if (confirm("Are you sure want to expire this SMS?")) {
    //     var data = {
    //       amount: dataParam.amount,
    //       bank: dataParam.type,
    //       trxid: dataParam.securitycode,
    //       phonenumber: dataParam.customerphone,
    //     };

    //     var jsonData = CRYPTO.encrypt(data);
    //     $http({
    //       method: "POST",
    //       url: webservicesUrl + "/smsLog_expireSms.php",
    //       data: { data: jsonData },
    //       headers: {
    //         "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //       },
    //     }).then(
    //       function mySuccess(response) {
    //         var data = CRYPTO.decrypt(response.data.data);
    //         if (data.status.toLowerCase() == "ok") {
    //           alert("Success!");
    //           $scope.getListData();
    //         } else {
    //           alert(data.message);
    //         }
    //       },
    //       function myError(response) {
    //         console.log(response);
    //       }
    //     );
    //   }
    // };

    // $scope.match = function (dataParam) {
    //   var modalInstance = $uibModal.open({
    //     animation: true,
    //     templateUrl:
    //       "js/Modal/TransactionSuggestionModal/TransactionSuggestionModal.template.html",
    //     controller: "TransactionSuggestionModalCtrl",
    //     size: "lg",
    //     scope: $scope,
    //     resolve: {
    //       items: function () {
    //         return {
    //           amount: dataParam.amount,
    //           bank: dataParam.type,
    //           trxid: dataParam.securitycode,
    //           phonenumber: dataParam.customerphone,
    //         };
    //       },
    //     },
    //   });

    //   modalInstance.result.then(
    //     function (returnValue) {
    //       var data = {
    //         futuretrxid: returnValue.futuretrxid,
    //         amount: dataParam.amount,
    //         bank: dataParam.type,
    //         trxid: dataParam.securitycode,
    //         phonenumber: dataParam.customerphone,
    //       };

    //       var jsonData = CRYPTO.encrypt(data);
    //       $http({
    //         method: "POST",
    //         url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
    //         data: { data: jsonData },
    //         headers: {
    //           "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //         },
    //       }).then(
    //         function mySuccess(response) {
    //           var data = CRYPTO.decrypt(response.data.data);
    //           if (data.status.toLowerCase() == "ok") {
    //             alert("Success!");
    //             $scope.getListData();
    //           } else {
    //             alert(data.message);
    //           }
    //         },
    //         function myError(response) {
    //           console.log(response);
    //         }
    //       );
    //     },
    //     function () {
    //       console.log("Modal dismissed at: " + new Date());
    //     }
    //   );
    // };

    $scope.show = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/SuspectedCustomerDetailModal/SuspectedCustomerDetailModal.template.html",
        controller: "SuspectedCustomerDetailModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              customerPhone: dataParam.customerPhone,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          console.log(returnValue);
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.checked = function (row) {
      if (
        confirm(
          "Are you sure want to flag checked customer phone " +
            row.customerPhone +
            "?"
        )
      ) {
        var data = {
          customerPhone: row.customerPhone,
        };

        var jsonData = CRYPTO.encrypt(data);
        $http({
          method: "POST",
          url: webservicesUrl + "/suspectedCustomer_checked.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              alert("Success!");
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            console.log(response);
          }
        );
      }
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      // $scope.getListData();
      //   $scope.getPhoneUserList();
    };
    $scope.init();
  },
]);

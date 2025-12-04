app.controller("EmergencyDepositPageCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$stateParams",
  "$uibModal",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal
  ) {
    //$scope.products = [];
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };
    $scope.Balance = {};
    $scope.Summary = {
      pendingDB: 0,
      pendingCR: 0,
      DB: 0,
      CR: 0,
      fee: 0,
    };
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: new Date(),
      minDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      startingDay: 1,
    };
    // $scope.popup1 = {
    //   opened: false,
    // };
    // $scope.open1 = function () {
    //   $scope.popup1.opened = true;
    // };
    // $scope.popup2 = {
    //   opened: false,
    // };
    // $scope.open2 = function () {
    //   $scope.popup2.opened = true;
    // };

    $scope.filter = {
      dateFrom: new Date(),
      dateTo: new Date(),
      filter: "",
      history: false,
    };
    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };
  //   $scope.getAgentList = function () {
  //     $http({
  //         method: "POST",
  //         url: webservicesUrl + "/getMasterMyBankNew.php",
  //         data: { 'data': '' },
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
  //     }).then(function mySuccess(response) {
  //         console.log("Response from server:", response);
  //         var data = CRYPTO.decrypt(response.data.data);
  //         console.log("Decrypted data:", data);
  
  //         if (data.status.toLowerCase() == 'ok') {
  //             let unique = {};
  //             let deduplicated = [];
  
  //             data.records.forEach(function (item) {
  //                 if (!unique[item.bankAccNo]) {
  //                     unique[item.bankAccNo] = true;
  //                     deduplicated.push(item);
  //                 }
  //             });
  //             $scope.agentList = deduplicated;
  //             console.log($scope.agentList)
  //             if (deduplicated.length > 0) {
  //                 $scope.filter.account = deduplicated[0].account;
  //             }
  //         } else {
  //             alert(data.message);
  //         }
  //     }, function myError(response) {
  //         console.log(response.status);
  //     });
  // };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "transaction-by-id.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        {
          name: "Future Trx ID",
          field: "futuretrxid",
          aggregationType: uiGridConstants.aggregationTypes.count,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() }}</div>',
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0,
          },
        },
        { name: "Date", field: "insert", width: 150 },
        { name: "Complete Date", field: "completedate", width: 150 },
        { name: "Merchant Code", field: "merchantcode", width: 100 },
        { name: "Customer Code", field: "customercode", width: 180 },
        { name: "CCY", field: "ccy", visible: false },
        {
          name: "Bank",
          field: "bankcode",
          sort: { direction: "asc" },
          width: 100,
        },
        {
          name: "Debit",
          field: "DB",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        {
          name: "Credit",
          field: "CR",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "IP", field: "ip", visible: false },
        { name: "Trans Type", field: "transactiontype", width: 100 },
        { name: "Status", field: "status", width: 120 },
        { name: "Memo", field: "memo", width: 100 },
        {
          name: "Callback Status",
          field: "callbackresponse",
          width: 150,
          cellTooltip: function (row, col) {
            return row.entity.callbackresponse;
          },
        },
        { name: "Account Src", field: "accountsrc", visible: false },
        {
          name: "Fee",
          field: "fee",
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
          width: 100,
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:0 }}</div>',
        },
        { name: "Notes", field: "notes", width: 150 },
        { name: "Notes 2", field: "notes2", width: 150 },
        { name: "Notes 3", field: "notes3", width: 150 },
        { name: "Sms Phone", field: "phonenumber", width: 150 },
        { name: "Sms Agent", field: "user", width: 150 },
        //{ name: 'Actual Transaction Date', field: 'notesactualdate' , width:150},
        { name: "Trans ID", field: "transactionid", width: 100 },
        { name: "Reference", field: "reference", visible: false },
        { name: "Alias", field: "alias", width: 100 },
        { name: "Actual Agent", field: "actualAgent", width: 100 },
        { name: "Acc Source", field: "accountno", width: 100 },
        { name: "Acc Source Name", field: "accountsrcname", width: 100 },
        { name: "Acc Dest", field: "accountdst", width: 100 },
        { name: "Acc Dest Name", field: "accountdstname", width: 100 },
        { name: "Server Name", field: "servername", width: 100 },
        { name: "Server URL", field: "serverurl", width: 100 },
        { name: "dis", field: "disable", visible: false },
        { name: "Receipt ID", field: "notes2", width: 100 },
        { name: "Memo 2", field: "memo2", width: 100 },
        {
          name: "Action",
          field: "futuretrxid",
          cellTemplate:
            ' <button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.updateMemo2(row.entity)">Update Memo 2</button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.analyze(row.entity)" ng-show="row.entity.status == \'Order need to check\'"  >Analyze</button>',
          width: 260,
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };
    
    $scope.getListData = function () {
      dateFrom = $scope.convertJsDateToString($scope.filter.dateFrom);
      dateTo = $scope.convertJsDateToString($scope.filter.dateTo);
      var data = {
        dateFrom: dateFrom,
        dateTo: dateTo,
      };
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/emergency_deposit_getList.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          console.log(data);
          if (data.status.toLowerCase() == "ok") {
            data.records = $scope.urlDecode(data.records);
            console.log(data.records);

            for (var i = 0, length = data.records.length; i < length; i++) {
              if (
                data.records[i]["transactiontype"] == "D" ||
                data.records[i]["transactiontype"] == "Topup" ||
                data.records[i]["transactiontype"] == "Y" ||
                data.records[i]["transactiontype"] == "I"
              ) {
                data.records[i]["DB"] = data.records[i]["amount"];
                data.records[i]["CR"] = "0";
              } else {
                data.records[i]["CR"] = data.records[i]["amount"];
                data.records[i]["DB"] = "0";
              }
              data.records[i]["fee"] = Number(data.records[i]["fee"]);
            }
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

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.emergency = function () {
      if (confirm("Are you sure want to run emergency process ?")) {
        dateFrom = $scope.convertJsDateToString($scope.filter.dateFrom);
        dateTo = $scope.convertJsDateToString($scope.filter.dateTo);
        var data = {
          dateFrom: dateFrom,
          dateTo: dateTo,
        };
        var jsonData = data;
        $scope.gridIsLoading = true;
        $http({
          method: "POST",
          url: webservicesUrl + "/Emergencydeposit.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            console.log(response)
            var data = response.data;
            $scope.gridIsLoading = false;
            if (data.status.toLowerCase() === "ok") {
              $scope.getListData();
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log("Request error:", response);
          }
        );
      }
    };

    $scope.init = function () {
      //$scope.getListAccount();
      //$scope.getListData();
      $scope.getAgentList();
      var info = localStorage.getItem("bropay-login-info");
      if (info) {
        try {
          $scope.currentLoginInfo = JSON.parse(info);
        } catch (err) {}
      }
      //console.log($scope.currentLoginInfo);
    };
    $scope.init();
  },
]);

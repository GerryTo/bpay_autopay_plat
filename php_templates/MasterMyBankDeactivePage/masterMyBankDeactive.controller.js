app.controller("masterMyBankDeactiveCtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "$uibModal",
  "uiGridConstants",
  function ($state, $scope, $http, $timeout, $uibModal, uiGridConstants) {
    //$scope.products = [];
    $scope.gridIsLoading = false;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Group", field: "group", width: 80 },
        { name: "Account No", field: "bankAccNo", width: 120 },
        { name: "Account Name", field: "bankAccName", width: 80 },
        {
          name: "Bank",
          field: "bankCode",
          width: 80,
          filter: { condition: uiGridConstants.filter.EXACT },
        },
        { name: "Login", field: "login", width: 80 },
        { name: "Type", field: "type", width: 60 },
        { name: "Active", field: "active", width: 80 },
        {
          name: "Balance",
          field: "curr",
          width: 80,
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Daily Limit",
          field: "dailylimit",
          width: 80,
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Daily",
          field: "daily",
          width: 80,
          cellFilter: "number: 2",
          cellClass: "grid-alignright",
          type: "number",
          aggregationType: uiGridConstants.aggregationTypes.sum,
          footerCellTemplate:
            '<div class="ui-grid-cell-contents" style="text-align:right">{{col.getAggregationValue() | number:2 }}</div>',
        },
        {
          name: "Action",
          field: "bankAccNo",
          width: 250,
          enableFiltering: false,
          //cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' + $scope.globallang.edit + '</button> <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.delete(row.entity)">' + $scope.globallang.delete + '</button>'
          cellTemplate:
            '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' +
            $scope.globallang.edit +
            '</button> <button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.lastTRX(row.entity)">' +
            $scope.globallang.lasttrx +
            '</button> <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.more(row.entity)">' +
            $scope.globallang.more +
            '</button></button> <button type="button" class="btn btn-success btn-sm" ng-click="grid.appScope.show(row.entity)">Show</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.backKK = function () {
      $state.go("master-mybank");
    };
    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getMasterMyDeactiveBank.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          //console.log(data);
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
    $scope.lastTRX = function (data) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/lasttransaction.html",
        controller: "LastTrxModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return data;
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {},
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };
    $scope.group = function () {
      var arr = $scope.gridApi.selection.getSelectedRows();
      if (arr.length > 0) {
        if (confirm("Are your sure want to group selected items ?")) {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: "templates/group.html",
            controller: "GroupModalCtrl",
            size: "sm",
            scope: $scope,
          });

          modalInstance.result.then(
            function (returnValue) {
              var selectedAcc = [];
              for (var i = 1; i <= arr.length; i++) {
                var temp = {
                  account: arr[i - 1].bankAccNo,
                  bank: arr[i - 1].bankCode,
                };
                selectedAcc.push(temp);
              }
              var obj = {
                groupname: returnValue,
                items: selectedAcc,
              };
              var jsonData = CRYPTO.encrypt(obj);
              $http({
                method: "POST",
                url: webservicesUrl + "/groupMyBank.php",
                data: { data: jsonData },
                headers: {
                  "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                },
              }).then(
                function mySuccess(response) {
                  var data = CRYPTO.decrypt(response.data.data);
                  if (data.status.toLowerCase() == "ok") {
                    $scope.getListData();
                  } else {
                    alert(data.message);
                  }
                },
                function myError(response) {
                  //console.log(response);
                }
              );
            },
            function () {
              console.log("Modal dismissed at: " + new Date());
            }
          );
        }
      }
    };
    $scope.more = function (param) {
      $state.go("transaction-account-by-company", {
        data: { accountno: param.bankAccNo },
      });
    };
    $scope.new = function () {
      $state.go("master-mybank-form", {
        data: { bankAccNo: "", bankCode: "" },
      });
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.addnew = function () {
      $state.go("master-mybank-form", {
        data: { bankAccNo: "", bankCode: "" },
      });
    };
    $scope.edit = function (data) {
      $state.go("master-mybank-form", {
        data: {
          bankAccNo: data.bankAccNo,
          bankCode: data.bankCode,
          type: data.type,
          active: data.active,
          dailylimit: data.dailylimit,
        },
      });
    };
    $scope.show = function (data) {
      //alert(data.bankAccName);
      $state.go("list-merchant-group", {
        data: { bankAccNo: data.bankAccNo, bankAccName: data.bankAccName },
      });
    };
    $scope.delete = function (data) {
      if (confirm("Are you sure want to delete [" + data.bankAccNo + "]?")) {
        var data = { bankAccNo: data.bankAccNo, bankCode: data.bankCode };
        var jsonData = CRYPTO.encrypt(data);

        $http({
          method: "POST",
          url: webservicesUrl + "/deleteMasterMyBank.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
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

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

app.controller("GroupModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  function ($scope, $uibModalInstance, $uibModal) {
    $scope.groupname = "";
    $scope.save = function () {
      $uibModalInstance.close($scope.groupname);
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);

app.controller("LastTrxModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "items",
  "$http",
  function ($scope, $uibModalInstance, $uibModal, items, $http) {
    $scope.data = {
      bank: "",
      account: "",
      name: "",
    };
    $scope.gridIsLoading = false;
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "FutureId", field: "futuretrxid", width: 100 },
        { name: "Insert", field: "insert", width: 150 },
        { name: "MerchantCode", field: "merchantcode", width: 150 },
        { name: "CustomerCode", field: "customercode", width: 150 },
        { name: "Type", field: "transactiontype", width: 100 },
        { name: "Amount", field: "amount", width: 120 },
        { name: "Fee", field: "Fee", width: 100 },
        { name: "Account Src", field: "accountno", width: 150 },
        { name: "Account Dst", field: "accountdst", width: 150 },
        { name: "TransactionID", field: "transactionid", width: 150 },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };
    $scope.getLastTrx = function () {
      if ($scope.data.account != "" && $scope.data.bank != "") {
        var data = { account: $scope.data.account, bank: $scope.data.bank };
        var jsonData = CRYPTO.encrypt(data);
        $scope.gridIsLoading = true;
        $http({
          method: "POST",
          url: webservicesUrl + "/getLastTransaction.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
              $scope.gridOptions.data = $scope.urlDecode(data.records);
            } else {
            }
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response.status);
          }
        );
      }
    };
    $scope.init = function () {
      $scope.data.bank = items.bankCode;
      $scope.data.account = items.bankAccNo;
      $scope.data.name = items.bankAccName;
      $scope.getLastTrx();
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
    $scope.init();
  },
]);

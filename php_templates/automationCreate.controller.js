app.controller("automationCreateCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "$uibModal",
    // Removed "uiGridConstants" - this was causing the issue
    function ($state, $scope, $http, $timeout, $uibModal) {
        //$scope.products = [];
        $scope.gridIsLoading = false;

        $scope.gridOptions = {
            showGridFooter: true,
            enableSorting: true,
            showColumnFooter: true,
            enableColumnResizing: true,
            enableGridMenu: true,
            
            // Export configuration (now should work)
            exporterExcelFilename: "AutomationCreateAdmin.xlsx",
            exporterExcelSheetName: "Sheet1",
            // exporterPdfMaxGridWidth: 500,
            
            enableFiltering: true,
            rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Main User", field: "mainUser" },
        { name: "Bank Code", field: "bankCode" },
        { name: "Operation Hour", field: "opentype" },
        { name: "Username", field: "username" },
        { name: "Phonenumber", field: "phonenumber" },
        // { name: "System", field: "system" },
        { name: "Appium Status", field: "useappium" },
        { name: "Automation Agent", field: "AutomationStatus",
          cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.AutomationStatus === 'YES' ? 'green': row.entity.AutomationStatus === 'NO' ? 'red' : 'orange'}">
                            {{row.entity.AutomationStatus}}
                         </div>`,
        },
        { name: "OTP Status", 
          field: "statusDesOtpSender",
          cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.statusDesOtpSender === 'ONLINE' ? 'green' : 'red'}"> {{row.entity.statusDesOtpSender}} </div>`,
        
        },
        {
          name: "status(online/offline)",
          field: "isOnline",
          cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.isOnline === 'ONLINE' ? 'green' : 'red'}">
                            {{row.entity.isOnline}}
                         </div>`,
        },
        { name: "Pin", field: "pin" },
        { name: "Serial Number", field: "serialNumber" },
        { name: "Server Name", field: "serverName" },
        // { name: 'Current Balance', field: 'newbalance',cellFilter: 'number: 2', cellClass: 'grid-alignright', type:'number' },
        {
            name: 'Action', field: 'merchantcode',
            cellTemplate: '<button type="button" class="btn btn-danger btn-sm" ng-click="grid.appScope.delete(row.entity)">' + $scope.globallang.delete + '</button>'
        }
      ],
      data: [],
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/automationCreate_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
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
    
    $scope.delete = function (data) {
      if (confirm("Are you sure want to delete [" + data.username + "]?")) {
        var data = { username: data.username };
        var jsonData = CRYPTO.encrypt(data);
        $scope.gridIsLoading = true;
        $http({
          method: "POST",
          url: webservicesUrl + "/deleteAutomationList.php",
          data: { data: jsonData },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == "ok") {
            $scope.gridIsLoading = false;
            $scope.refresh();
            alert("success delete automation account");
            } else {
              alert(data.message);
            }
          },
          function myError(response) {
            console.log(response);
            $scope.gridIsLoading = false;
          }
        );
      }
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.new = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/AutomationCreateModal/automationCreateModal.template.html?v=2.1",
        controller: "automationCreateModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {},
      });

      modalInstance.result.then(function (returnResult) {
        $scope.gridIsLoading = true;
        console.log(returnResult);
        var params = {
          mainUser: returnResult.mainUser,
          bankCode: returnResult.bankCode,
          username: returnResult.username,
          system: returnResult.system,
          useappium: returnResult.useappium,
          phonenumber: returnResult.phonenumber,
          provider: returnResult.provider,
        };
        $http({
          method: "post",
          url: webservicesUrl + "/automationCreate_create.php",
          data: { data: params },
          Headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = response.data;
            if (data.message == "success add automation accounnt") {
              alert("success add automation account");
            } else {
              alert(data.message);
            }
            modalInstance.close();
            $scope.getListData();
          },
          function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response);
          }
        );
      });
    };

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

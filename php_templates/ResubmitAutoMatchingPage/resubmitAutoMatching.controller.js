app.controller("resubmitAutoMatchingCtrl", [
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
      $scope.filter = {
        type: "0",
        amount: 1000,
      };
      $scope.filterUsed = {
        type: "0",
        amount: 1000,
      };
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
        enableSelectionBatchEvent: false,
        enableSorting: true,
        showColumnFooter: true,
        enableFiltering: true,
        enableGridMenu: true,
        enableColumnResizing: true,
        exporterExcelFilename: "resubmit-automatching.xlsx",
        exporterExcelSheetName: "Sheet1",
        rowTemplate: "templates/rowTemplate.html",
        columnDefs: [
          {
            name: "Id",
            field: "id",
            width: 120,
          },
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
          { name: "Bank", field: "bank", width: 120 },
          { name: "Customer Account", field: "customerAccount", width: 120 },
          { name: "Trx Id", field: "trxId", width: 120 },
          { name: "Amount", field: "amount", width: 120 },
          { name: "User", field: "agentUser", width: 120 },
          { name: "Phone Number", field: "agentPhone", width: 120 },
          { name: "Agent Account No", field: "agentAccount", width: 120 },
        ],
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.rowsSelected = $scope.gridApi.selection.getSelectedRows();
            $scope.countRows = $scope.rowsSelected.length;
            if ($scope.countRows > 20) {
              row.setSelected(false); // Remove selection for the current row
            }
          });
        },
        data: [],
      };
  
      $scope.getListData = function () {
        $scope.gridIsLoading = true;
  
        // $scope.filterUsed = $scope.filter;
  
        var jsonData = CRYPTO.encrypt($scope.filter);
  
        $http({
          method: "POST",
          url: webservicesUrl + "/resubmitAutoMatching_getList.php",
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
            //   for (var i = 0; i < data.records.length; i++) {
            //     data.records[i].message = decodeURIComponent(
            //       data.records[i].message
            //     );
            //     data.records[i].from = decodeURIComponent(data.records[i].from);
            //   }
  
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
      
      $scope.submit = function () {
        $tmp = $scope.filterUsed;
        $tmp.list = $scope.gridApi.selection.getSelectedRows();
  
        if ($tmp.list.length == 0) {
          alert("Please choose auto matching to submit");
          return false;
        }
  
        if (confirm("Submit " + $tmp.list.length + " Auto Matching?")) {
          $scope.gridIsLoading = true;
          var jsonData = CRYPTO.encrypt($tmp);
  
          $http({
            method: "POST",
            url: webservicesUrl + "/resubmitAutoMatching_submit.php",
            data: { data: jsonData },
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }).then(
            function mySuccess(response) {
              $scope.gridIsLoading = false;
              var data = CRYPTO.decrypt(response.data.data);
  
              if (data.status.toLowerCase() == "ok") {
                alert("Matching is in progress. Please refresh the list.");
                $scope.gridOptions.data = [];
              } else {
                alert(data.message);
              }
            },
            function myError(response) {
              $scope.gridIsLoading = false;
              console.log(response.status);
            }
          );
        }
      };
  
      $scope.refresh = function () {
        $scope.getListData();
      };
  
      $scope.init = function () {
        // $scope.getListData();
        // $scope.getPhoneUserList();
      };
      $scope.init();
    },
  ]);
  
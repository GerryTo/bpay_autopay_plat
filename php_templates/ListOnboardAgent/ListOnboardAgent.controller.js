app.controller("listOnboardCtrl", [
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
        { name: "Date Onboard", field: "dateOnboard", aggregationType: uiGridConstants.aggregationTypes.count },
        { name: "Date Success", field: "dateSuccess"},
        { name: "Account No", field: "bankAccNo"},
        { name: "Account Name", field: "bankAccName"},
        { name: "Bank", field: "bankCode"},
        // { name: "Type", field: "type", width: 60 },
        // { name: "Active", field: "active", width: 80 },
        // { name: "Open Type", field: "opentype",width: 120 },
        { name: "Automation Status", field: "AutomationStatus"},
        { name: "Last Online", field: "LastOnline"},
        { name: "Onboard Status", field: "isonline"},
        { name: "Last OTP", field: "LastOtp"},
        { name: "Last Update Automation Status", field: "lastAutomationStatus"},
        { name: "Last Crawling", field: "LastCrawl"},
        { name: "Last TRX ID", field: "LastTrxid"},
        {
          name: "Last Balance",
          field: "lastBalance",
          width: 100,
          cellFilter: "number: " + decimalDigit,
          cellClass: "grid-alignright",
          type: "number",
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };


    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getOnboardAgent.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          // data.records = data.records;
          console.log(data.records);
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

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.AgentOnboard = function () {
    var arr = $scope.gridApi.selection.getSelectedRows();
    if (arr.length > 0) {
        var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'templates/dateonboard.html',
        controller: 'OnboardDateCtrl',
        size: 'sm',
        scope: $scope
        });

        modalInstance.result.then(function (returnValue) {
        var selectedAcc = [];
        for (var i = 0; i < arr.length; i++) {
            var temp = { account: arr[i].bankAccNo, bank: arr[i].bankCode };
            selectedAcc.push(temp);
        }

        var obj = {
            date: returnValue,
            items: selectedAcc
        };
        console.log(obj);

        var jsonData = CRYPTO.encrypt(obj);
        $http({
            method: "POST",
            url: webservicesUrl + "/updateOnboardAgent.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
            $scope.getListData();
            } else {
            alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
        }, function () {
        console.log('Modal dismissed at: ' + new Date());
        });
    }
    }




    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);
app.controller("OnboardDateCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  function ($scope, $uibModalInstance, $uibModal) {
    $scope.dateonboard = "";

    $scope.save = function () {
      // pastikan format YYYY-MM-DD
      var formattedDate = "";
      if ($scope.dateonboard) {
        // jika dateonboard adalah Date object
        formattedDate = $scope.dateonboard.toISOString().split("T")[0];
      }
      $uibModalInstance.close(formattedDate);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);



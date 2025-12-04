app.controller("ListAgentFailedCrawlCtrl", [
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
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    $scope.filter = {
      date: new Date(),
      type: "1",
    };
        $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };
    
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      enableFiltering: true,
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Mark Error", field: "markerror", aggregationType: uiGridConstants.aggregationTypes.count},
        { name: "Error Mybank", field: "mybankerror"},
        { name: "Date", field: "date"},
        { name: "Success Onboard", field: "successoboard"},
        { name: "Username", field: "user"},
        { name: "Bank", field: "bankCode"},
        { name: "Account No", field: "accountno"},
        { name: "Automation Status", field: "automationstatus"},
        {
          name: "Action",
          field: "merchantcode",
          cellTemplate:
              '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.recrawl(row.entity)">Recrawl</button>',
          // '<button type="button" class="btn btn-warning btn-sm" ng-click="grid.appScope.checkDeposit(row.entity,0)">Stop</button>',
          width: 150,
        },
        // { name: "Type", field: "type", width: 60 },
        // { name: "Active", field: "active", width: 80 },
        // { name: "Open Type", field: "opentype",width: 120 },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };


    $scope.getListData = function () {
      var date = $scope.convertJsDateToString($scope.filter.date);
      var type = $scope.filter.type;
      var data = { date: date, type: type };
      console.log(data);
      var jsonData = data;
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getfailedsummary.php",
        data: { data: jsonData },
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

    $scope.recrawl = function (data) {
          $scope.gridIsLoading = true;
          var jsonData = {
              accountNo: data.accountno,
          };

          $http({
              method: "POST",
              url: webservicesUrl + "/setCrawlSummary.php",
              data: { data: jsonData },
              headers: {
                  "Content-Type":
                      "application/x-www-form-urlencoded;charset=UTF-8",
              },
          }).then(
              function mySuccess(response) {
                  console.log(response);
                  if (response.data.status == "ok") {
                      alert("SUCCESS!");
                      $scope.getListData();
                      $scope.gridIsLoading = false;
                  }
              },
              function myError(response) {
                  $scope.gridIsLoading = false;
                  console.log(response);
              }
          );
      };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.bulk = function () {
      var arr = $scope.gridApi.selection.getSelectedRows();
      if (arr.length > 0) {
          if (confirm("Are your sure want Recrawl selected items ?")) {
              var selectedAcc = [];
              for (var i = 0; i < arr.length; i++) {
                  var temp = {
                      account: arr[i].accountno,
                      bank: arr[i].bankCode,
                      user: arr[i].user,
                  };
                  selectedAcc.push(temp);
              }

              // kalau memang ga perlu groupname dari modal, bisa kasih default
              var obj = {
                  groupname: "defaultGroup", 
                  items: selectedAcc,
              };

              var jsonData = CRYPTO.encrypt(obj);

              $http({
                  method: "POST",
                  url: webservicesUrl + "/setCrawlSummaryBulk.php",
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
      }
    };

    $scope.group = function () {
      var arr = $scope.gridApi.selection.getSelectedRows();
      if (arr.length > 0) {
        if (confirm("Are your sure want to mark error selected items ?")) {
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: "templates/error.html",
            controller: "ErrorModalCtrl",
            size: "sm",
            scope: $scope,
          });

          modalInstance.result.then(
            function (returnValue) {
              var selectedAcc = [];
              for (var i = 1; i <= arr.length; i++) {
                var temp = {
                  account: arr[i - 1].accountno,
                  bank: arr[i - 1].bankCode,
                  user: arr[i - 1].user,
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
                url: webservicesUrl + "/markerror.php",
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
app.controller("ErrorModalCtrl", [
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


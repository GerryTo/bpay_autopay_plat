app.controller("customerCodeFlagCtrl", [
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

    $scope.acclist = [];

    $scope.gridIsLoading = false;

    $scope.currentLoginInfo = {};

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
          name: "Customer Code",
          field: "v_customercode",
        },
        {
          name: "Merchant Code",
          field: "v_merchantcode",
        },
        {
          name: "Order Need To Check", field: "total_flag", width: 150,
        },
        {
          name: "Transaction Failed", field: "total_failed", width: 150,
        },
        {
          name: "Action",
          field: "futuretrxid",
          width: 500,
          cellTemplate:
            '<button type="button" class="btn btn-info btn-sm" style="margin-right:2px;" ng-click="grid.appScope.transdetail(row.entity)">Order Need To Check List</button>' +
            '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.transdetailfailed(row.entity)">Transaction Failed List</button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.addtodb(row.entity)">Add Customer Code</button>'
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.transdetail = function (data) {
      console.log(data.v_customercode);
      console.log(data.v_merchantcode);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/DetailTransactionCustomerCodeModal/DetailTransactionCustomerCode.template.html?v=" +
          new Date().getTime(),
        controller: "detailTransactionCustomerCodeCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return { customercode: data.v_customercode, merchantcode: data.v_merchantcode };
          },
        },
      });
    }

    $scope.transdetailfailed = function (data) {
      console.log(data.v_customercode);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/DetailTransactionCustomerCodeFailedModal/DetailTransactionCustomerCodeFailed.template.html?v=" +
          new Date().getTime(),
        controller: "detailTransactionCustomerCodeFailedCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return { customercode: data.v_customercode };
          },
        },
      });
    }

    $scope.addtodb = function (data) {
      console.log(data.v_customercode);
      $scope.gridIsLoading = true;

      var data = {
        customercode: data.v_customercode,
        merchantcode: data.v_merchantcode
      }
      $http({
        method: "POST",
        url: webservicesUrl + "/addCustomerCodeToTable.php",
        data: { data: data },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          console.log(response.data.status);
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
            alert(data.message);
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          alert(response.data.message);
        }
      );
    }

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/getCustomercodeByTransaction.php",
        data: [],
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "ok") {
            console.log(data.records);
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

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  },
]);

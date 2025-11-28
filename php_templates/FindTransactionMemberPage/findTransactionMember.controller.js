app.controller("findTransactionMemberCtrl", [
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
          name: "Account No",
          field: "v_accountno",
        },
        {
          name: "Total", field: "total", width: 150,
        },
        {
          name: "Action",
          field: "futuretrxid",
          width: 120,
          cellTemplate:
            '<button type="button" class="btn btn-info btn-sm" style="margin-right:2px;" ng-click="grid.appScope.transdetail(row.entity)">Detail</button>'
        },
        {
          name: "New",
          field: "status_check",
          width: 100,
          cellTemplate: `
            <div class="ui-grid-cell-contents" ng-if="row.entity.status_check === 'true'">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:red;"></span>
            </div>
          `,
        }
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.transdetail = function (data) {
      console.log(data);
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/DetailTransactionListModal/DetailTransactionListModal.template.html?v=" +
          new Date().getTime(),
        controller: "detailTransactionListModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return { accountno: data.v_accountno };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          // if (returnValue.type == 1) {
          //   //continue matching
          //   $scope.sms(params);
          // } else if (returnValue.type == 2) {
          //   //failed
          //   $scope.cancel(params);
          // } else if (returnValue.type == 3) {
          //   $scope.SuccessDeposit(params.futuretrxid);
          // }
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    }

    $scope.getListData = function () {
      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/findTransactionMember_getList.php",
        data: [],
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          //$scope.getAccountBalance();
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
      //$scope.getListAccount();
      $scope.getListData();
      var info = localStorage.getItem("bropay-login-info");
      if (info) {
        try {
          $scope.currentLoginInfo = JSON.parse(info);
        } catch (err) { }
      }
      //console.log($scope.currentLoginInfo);
    };
    $scope.init();
  },
]);

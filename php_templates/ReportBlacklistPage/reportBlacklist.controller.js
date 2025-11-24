app.controller("reportBlacklistCtrl", [
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
    //$scope.products = [];
    var index = 0;
    $scope.invalidNotification = false;
    $scope.notifications = {};
    $scope.gridIsLoading = false;
    $scope.currentPending = 0;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.interval = null;
    $scope.stillLoading = false;

    $scope.inlcudeBlacklist = false;

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "report-blacklist.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "Merchant Code", field: "merchantCode", width: 220 },
        { name: "Customer Code", field: "customerCode", width: 220 },
        // {
        //   name: "No. Different Src Acc",
        //   field: "count",
        //   type: "number",
        //   width: 120,
        //   cellClass: "grid-alignright",
        // },
        // { name: "Blacklist", field: "isBlacklist", width: 100 },
        // {
        //   name: "Action",
        //   field: "customerCode",
        //   width: 150,
        //   enableFiltering: false,
        //   cellTemplate:
        //     '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.detail(row.entity)">Detail</button>' +
        //     '<button type="button" class="btn btn-warning btn-sm" ng-show="row.entity.isBlacklist == \'\'" ng-click="grid.appScope.blacklist(row.entity)">Blacklist</button>',
        // },
        {
          name: "Action",
          field: "customerCode",
          width: 150,
          cellTemplate:
              '<button type="button" class="btn btn-danger btn-sm" ng-click="grid.appScope.delete(row.entity)">Delete</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.detail = function (params) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/FlagModal/FlagModal.template.html?v=" +
          new Date().getTime(),
        controller: "FlagModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              merchantCode: params.merchantCode,
              customerCode: params.customerCode,
            };
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

    $scope.new = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl:
          "js/Modal/AddBlacklistCustomerCodeModal/addBlacklistCustomerCodeModal.template.html?v=2.1",
        controller: "AddBlacklistCustomerCodeModalCtrl",
        size: "md",
        scope: $scope,
        resolve: {},
      });

      modalInstance.result.then(function (returnResult) {
        $scope.gridIsLoading = true;
        console.log(returnResult);
        var params = {
          customercode: returnResult.customercode,
          merchantcode: returnResult.merchantcode,
        };
        $http({
          method: "post",
          url: webservicesUrl + "/addBlackListCustomerCode.php",
          data: { data: params },
          Headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = response.data;
            if (data.status == "ok") {
              alert("success add customer code to blacklist");
            } else {
              alert(data.message);
            }
            modalInstance.close();
            $scope.getListData();
          },
          function myError(response) {
            $scope.gridIsLoading = false;
          }
        );
      });
    };

    $scope.delete = function (params) {
      if (
          confirm(
              "Are you sure want to delete [" +
                  params.merchantCode +
                  ", " +
                  params.customerCode +
                  "] ?"
          )
      ) {
          var data = {
              merchantCode: params.merchantCode,
              customerCode: params.customerCode,
          };
          var jsonData = CRYPTO.encrypt(data);

          $http({
              method: "POST",
              url: webservicesUrl + "/reportBlacklist_delete.php",
              data: { data: jsonData },
              headers: {
                  "Content-Type":
                      "application/x-www-form-urlencoded;charset=UTF-8",
              },
          }).then(
              function mySuccess(response) {
                  $scope.gridIsLoading = false;
                  var data = CRYPTO.decrypt(response.data.data);
                  if (data.status.toLowerCase() == "ok") {
                      alert("Customer Deleted");
                      $scope.getListData();
                  } else {
                      alert(data.message);
                  }
              },
              function myError(response) {
                  console.log(response.status);
              }
          );
      }
  };
  
    // $scope.blacklist = function (params) {
    //   if (
    //     confirm(
    //       "Are you sure want to blacklist [" +
    //         params.merchantCode +
    //         ", " +
    //         params.customerCode +
    //         "] ?"
    //     )
    //   ) {
    //     var data = {
    //       merchantCode: params.merchantCode,
    //       customerCode: params.customerCode,
    //     };
    //     var jsonData = CRYPTO.encrypt(data);

    //     $http({
    //       method: "POST",
    //       url: webservicesUrl + "/report_flagCustomer_blacklist.php",
    //       data: { data: jsonData },
    //       headers: {
    //         "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //       },
    //     }).then(
    //       function mySuccess(response) {
    //         $scope.gridIsLoading = false;
    //         var data = CRYPTO.decrypt(response.data.data);
    //         if (data.status.toLowerCase() == "ok") {
    //           alert("Customer blacklisted");
    //           $scope.getListData();
    //         } else {
    //           alert(data.message);
    //         }
    //       },
    //       function myError(response) {
    //         console.log(response.status);
    //       }
    //     );
    //   }
    // };

    $scope.getListData = function () {
      if ($scope.stillLoading) return false;

      $scope.gridIsLoading = true;
      $scope.stillLoading = true;
      // var from = $scope.convertJsDateToString($scope.filter.fromdate)+' 00:00:00';
      // var to = $scope.convertJsDateToString($scope.filter.todate)+ ' 23:59:59';

      var data = { includeBlacklist: $scope.includeBlacklist ? 1 : 0 };
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/report_blacklist.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          $scope.stillLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.gridOptions.data = data.records;
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.status);
          $scope.stillLoading = false;
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.addUnloadEvent = function () {
      if (window.addEventListener) {
        window.addEventListener("beforeunload", handleUnloadEvent);
      } else {
        //For IE browsers
        window.attachEvent("onbeforeunload", handleUnloadEvent);
      }
    };

    function handleUnloadEvent(event) {
      clearInterval($scope.interval);
      $scope.removeUnloadEvent();
    }

    //Call this when you want to remove the event, example, if users fills necessary info
    $scope.removeUnloadEvent = function () {
      if (window.removeEventListener) {
        window.removeEventListener("beforeunload", handleUnloadEvent);
      } else {
        window.detachEvent("onbeforeunload", handleUnloadEvent);
      }
    };

    $scope.init = function () {
      $scope.getListData();
      $scope.interval = setInterval(() => {
        $scope.getListData();
      }, 120000);
      $scope.addUnloadEvent();
    };
    $scope.init();
  },
]);

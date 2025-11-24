app.controller("balanceDifferenceCtrl", [
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

    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1);
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: maxDate,
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
      fromdate: maxDate,
      todate: maxDate,
      merchantCode: "ALL",
      trxid: "",
    };
    $scope.merchantList = [];
    //------------------

    //$scope.products = [];
    $scope.gridIsLoading = false;
    $scope.getHeight = function () {
      return window.innerHeight - 180;
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableGrouping: false,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      exporterExcelFilename: "balance-diff.xlsx",
      exporterExcelSheetName: "Sheet1",
      rowTemplate: "templates/rowTemplate.html",
      rowHeight: "85",
      columnDefs: [
        { name: "Merchant Code", field: "merchantcode", width: 150 },
        { name: "Date", field: "date", width: 100 },
        {
          name: "Difference",
          cellTemplate: `<table style="border-collapse:unset; border-spacing:5px">
            <tr>
              <td style="width:25%">Deposit</td>
              <td>{{row.entity.diff_deposit}}</td>
            </tr>
            <tr>
              <td>Withdrawal</td>
              <td>{{row.entity.diff_withdraw}}</td>
            </tr>
            <tr>
              <td>Fee</td>
              <td>{{row.entity.diff_fee}}</td>
            </tr>
          </table>`,
        },
        {
          name: "Action",
          width: 94,
          cellTemplate:
            '<button type="button" class="btn btn-info btn-sm" ng-click="grid.appScope.detail(row.entity)">Detail</button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getMerchantList = function () {
      $http({
        method: "POST",
        url: webservicesUrl + "/masterMerchant_getList.php",
        data: { data: "" },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            $scope.merchantList = data.records;
            // if (data.records.length > 0) {
            //   $scope.filter.merchantCode = data.records[0].merchantcode;
            // }
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          console.log(response.status);
        }
      );
    };

    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      var from =
        $scope.convertJsDateToString($scope.filter.fromdate) + " 00:00:00";
      var to = $scope.convertJsDateToString($scope.filter.todate) + " 23:59:59";

      var data = {
        datefrom: from,
        dateto: to,
        merchant: $scope.filter.merchantCode,
      };
      var jsonData = CRYPTO.encrypt(data);

      $http({
        method: "POST",
        url: webservicesUrl + "/getBalanceDifference.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          console.log(data);
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

    $scope.detail = function (dataParam) {
      var modalInstance = $uibModal.open({
        animation: true,
        template: `
            <div class="modal-header">
                <h3 class="modal-title">Balance Difference Detail</h3>
            </div>
            <div class="modal-body">
                <div class="row" style="margin-bottom:8px;">
                  <div class="col-xs-12 col-sm-4 col-md-2 col-lg-2">
                    <p class="input-group">
                      <input
                        type="text"
                        class="form-control input-sm"
                        uib-datepicker-popup="{{datepickerConfig.format}}"
                        ng-model="data.date"
                        is-open="popup1.opened"
                        datepicker-options="dateOptions"
                        ng-required="true"
                        close-text="Close"
                        alt-input-formats="datepickerConfig.altInputFormats"
                        placeholder="date"
                      />
                      <span class="input-group-btn">
                        <button
                          type="button"
                          class="btn btn-default btn-sm"
                          ng-click="open1()"
                        >
                          <i class="glyphicon glyphicon-calendar"></i>
                        </button>
                      </span>
                    </p>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-md-2 col-lg-2">
                    <p class="input-group">
                      <select
                        class="form-control"
                        ng-model="data.merchant"
                        id="merchant"
                      >
                        <option value="ALL">ALL</option>
                        <option
                          ng-repeat="item in merchantList"
                          value="{{item.merchantcode}}"
                          ng-selected="{{item.merchantcode}}==={{data.merchant}}" 
                        >
                          {{item.merchantcode}}
                        </option>
                      </select>
                    </p>
                  </div>
                  <div class="col-xs-12 col-sm-4 col-md-2 col-lg-2">
                    <button class="btn btn-default btn-sm" type="button" ng-click="getList()">Refresh</button>&nbsp; &nbsp;&nbsp;
                  </div>
                </div>
                <div id="grid1" ui-grid="gridOptions" class="grid" ui-grid-resize-columns ui-grid-auto-resize ng-style="{'height': '440px'}" >
                    <div class="grid-nodata-container" ng-show="gridOptions.data.length == 0 && !gridIsLoading">No Data Available</div>
                    <div class="grid-loading-container" ng-show="gridIsLoading">
                        <img src="images/loading.gif" />
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-warning" type="button" ng-click="$close()">Close</button>
            </div>
            `,
        controller: "balanceDifferenceModalCtrl",
        size: "lg",
        scope: $scope,
        resolve: {
          items: function () {
            return {
              date: dataParam.date,
              merchant: dataParam.merchantcode,
              merchantList: $scope.merchantList,
            };
          },
        },
      });

      modalInstance.result.then(
        function (returnValue) {
          // var data = {
          //     futuretrxid : returnValue.futuretrxid,
          //     amount: dataParam.amount,
          //     bank: dataParam.type,
          //     trxid: dataParam.securitycode,
          //     phonenumber: dataParam.customerphone
          // };
          // console.log(data);
          // var jsonData = CRYPTO.encrypt(data);
          // $http({
          //     method: "POST",
          //     url: webservicesUrl + "/smsLog_saveMatchTransaction.php",
          //     data: { 'data': jsonData },
          //     headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
          // }).then(function mySuccess(response) {
          //     var data = CRYPTO.decrypt(response.data.data);
          //     if (data.status.toLowerCase() == 'ok') {
          //         alert('Success!');
          //         $scope.getListData();
          //     } else {
          //         alert(data.message);
          //     }
          // }, function myError(response) {
          //     console.log(response);
          // });
        },
        function () {
          console.log("Modal dismissed at: " + new Date());
        }
      );
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      // $scope.getListData();
      $scope.getMerchantList();
    };
    $scope.init();
  },
]);

app.controller("balanceDifferenceModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$uibModal",
  "items",
  "$http",
  function ($scope, $uibModalInstance, $uibModal, items, $http) {
    $scope.datepickerConfig = {
      formats: ["dd-MMMM-yyyy", "yyyy/MM/dd", "dd.MM.yyyy", "shortDate"],
      format: "dd-MMMM-yyyy",
      altInputFormats: ["M!/d!/yyyy"],
    };

    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1);
    $scope.dateOptions = {
      //dateDisabled: disabled,
      formatYear: "yy",
      maxDate: maxDate,
      //minDate: new Date(),
      startingDay: 1,
    };
    $scope.popup1 = {
      opened: false,
    };
    $scope.open1 = function () {
      $scope.popup1.opened = true;
    };

    $scope.data = {
      date: maxDate,
      merchant: "",
    };

    $scope.gridIsLoading = false;
    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableColumnResizing: true,
      enableGridMenu: true,
      rowTemplate: "templates/rowTemplate.html",
      headerTemplate: "<div></div>",
      rowHeight: "365",
      columnDefs: [
        {
          name: "deposit",
          cellTemplate: `<table style="border-collapse:unset; border-spacing:5px 25px">
            <tr>
              <td style="width:60%">Total Deposit</td>
              <td>{{row.entity.deposit}}</td>
            </tr>
            <tr>
              <td>Total Deposit Report</td>
              <td>{{row.entity.report_deposit}}</td>
            </tr>
            <tr>
              <td>Difference Deposit</td>
              <td>{{row.entity.diff_deposit}}</td>
            </tr>
          </table>`,
        },
        {
          name: "withdraw",
          cellTemplate: `<table style="border-collapse:unset; border-spacing:5px 25px">
            <tr>
              <td style="width:60%">Total Withdraw</td>
              <td>{{row.entity.withdraw}}</td>
            </tr>
            <tr>
              <td>Total Withdraw Report</td>
              <td>{{row.entity.report_withdraw}}</td>
            </tr>
            <tr>
              <td>Difference Withdraw</td>
              <td>{{row.entity.diff_withdraw}}</td>
            </tr>
          </table>`,
        },
        {
          name: "fee",
          cellTemplate: `<table style="border-collapse:unset; border-spacing:5px 25px">
            <tr>
              <td style="width:60%">Total Bropay Fee</td>
              <td>{{row.entity.fee}}</td>
            </tr>
            <tr>
              <td>Total Bropay Fee Report</td>
              <td>{{row.entity.report_fee}}</td>
            </tr>
            <tr>
              <td>Difference Bropay Fee</td>
              <td>{{row.entity.diff_fee}}</td>
            </tr>
          </table>`,
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      data: [],
    };

    $scope.getList = function () {
      var data = {
        datefrom: $scope.data.date,
        dateto: $scope.data.date,
        merchant: $scope.data.merchant,
      };

      console.log(data);

      var jsonData = CRYPTO.encrypt(data);
      $scope.gridIsLoading = true;

      $http({
        method: "POST",
        url: webservicesUrl + "/getBalanceDifference.php",
        data: { data: jsonData },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = CRYPTO.decrypt(response.data.data);
          if (data.status.toLowerCase() == "ok") {
            console.log(data);
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

    $scope.init = function () {
      $scope.data.date = new Date(items.date);
      $scope.data.merchant = items.merchant;
      $scope.merchantList = items.merchantList;
      $scope.getList();
    };
    $scope.init();
  },
]);

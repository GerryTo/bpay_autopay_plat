app.controller("updateTransactionStatusNewCtrl", ["$state", "$scope", "$http", "$timeout", "uiGridConstants", "$stateParams", "$uibModal", 
function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal )
    {
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
            // fromdate : new Date(),
            // todate: new Date(),
            // accountno: '0',
            transId: "",
            history: false,
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
                    filter: { condition: uiGridConstants.filter.EXACT },
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
                { name: "Trans ID", field: "transactionid", width: 100 },
                { name: "Reference", field: "reference", visible: false },
                { name: "Alias", field: "alias", width: 100 },
                { name: "Acc Source", field: "accountno", width: 100 },
                { name: "Acc Source Name", field: "accountsrcname", width: 100 },
                { name: "Acc Dest", field: "accountdst", width: 100 },
                { name: "Acc Dest Name", field: "accountdstname", width: 100 },
                { name: "Server Name", field: "servername", width: 100 },
                { name: "Server URL", field: "serverurl", width: 100 },
                { name: "dis", field: "disable", visible: false },
                { name: "Receipt ID", field: "notes2", width: 100 },
                { name: "Memo", field: "memo", width: 100 },
                {
                    name: "Action",
                    field: "futuretrxid",
                    width: 300,
                    cellTemplate:
                    '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.edit(row.entity)">Update Status & Amount</button>'+
                    '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.editNotes3(row.entity.notes3, row.entity.futuretrxid, row.entity.transactionid)">Edit Notes 3</button>'+
                    '<button type="button" class="btn btn-secondry btn-sm" style="margin-right:2px;" ng-click="grid.appScope.editNotes2(row.entity.notes2, row.entity.futuretrxid, row.entity.transactionid)">Edit Notes 2</button>'
                },
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            },
            data: [],
        };
  
        $scope.validate = function (row) {
            //((row.entity.status == \'Order need to check\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Pending\' && row.entity.transactiontype == \'D\') || (row.entity.status == \'Transaction Failed\' && row.entity.transactiontype == \'D\')) && row.entity.disable ==\'1\' && (\''+$scope.currentLoginInfo.type+'\'==\'S\' || \''+$scope.currentLoginInfo.type+'\' == \'A\')
            if (
            ((row.status == "Order need to check" && row.transactiontype == "D") ||
                (row.status == "Pending" && row.transactiontype == "D") ||
                (row.status == "Transaction Failed" && row.transactiontype == "D")) &&
            row.disable == "1" &&
            $scope.currentLoginInfo.type == "S"
            )
            return true;
            else return false;
        };  

        $scope.edit = function (data) {
            var modalInstance = $uibModal.open({
            animation: true,
            templateUrl:
                "js/Modal/UpdateTransactionStatusNew/UpdateTransactionStatusModal.template.html?v=1",
            controller: "UpdateTransactionStatusModalCtrl",
            size: "md",
            scope: $scope,
            resolve: {
                params: function () {
                return data;
                },
            },
            });
            modalInstance.result.then(
            function (returnValue) {
            // console.log(returnValue);
            data2 = {
                status: returnValue.status,
                notes3: data.notes3,
                transactionid: data.transactionid,
                history: $scope.filter.history,
                chgAmt: returnValue.chgAmt,
                chgChk: returnValue.chgChk,
                pass: "",
                amount: returnValue.amount
            }
            console.log(data2);
            if(confirm("Are you sure want to update "+data2.notes3+" ?") == true) {
                var jsonData = CRYPTO.encrypt(data2);
                $http({
                  method: "POST",
                  url: webservicesUrl + "/updateTransactionStatusNew.php",
                  data: { 'data': jsonData },
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                }).then(function mySuccess(response) {
                    $scope.gridIsLoading = false;
                    var data = CRYPTO.decrypt(response.data.data);
                        alert(data.message);
                        $scope.getListData();
                        // console.log(data)
                }, function myError(response) {
                    $scope.gridIsLoading = false;
                    alert(0)
                    console.log(response.status);
                    $scope.getListData();
                });
            }
            else{
                $scope.gridIsLoading = false;
            }
        }
        );
        };

        $scope.editNotes3 = function (notes3, futureId, transactionId) {
            var modalInstance = $uibModal.open({
            animation: true,
            templateUrl:
                "js/Modal/transactionUpdateNotes3/transactionUpdateNotes3SuccessModal.template.html?v=1",
            controller: "transactionUpdateNotes3SuccessModalCtrl",
            size: "md",
            scope: $scope,
            resolve: {
                dataParam: function () {
                return {notes3,futureId,transactionId};
                },
            },
            });
            modalInstance.result.then(
            function (returnValue) {
                var data = {
                    id: futureId,
                    notes: returnValue.notes3,
                    history: $scope.filter.history,
                  };
            if(confirm("Are you sure want to update "+notes3+" ?") == true) {
                var jsonData = CRYPTO.encrypt(data);
                $http({
                  method: "POST",
                  url: webservicesUrl + "/transactionUpdateNotesById.php",
                  data: { 'data': jsonData },
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                }).then(
                    function mySuccess(response) {
                      var data = CRYPTO.decrypt(response.data.data);
                      // var data = response.data.data;
                      console.log(data);
                      if (data.status.toLowerCase() == "ok") {
                        alert("Success!");
                        $scope.getListData();
                      } else {
                        console.log(data.message);
                        alert(data.message);
                      }
                    },
                    function myError(response) {
                      console.log(response);
                    }
                  );
            }
            else{
                $scope.gridIsLoading = false;
            }
        }
        );
        };

        $scope.editNotes2 = function (notes2, futureId, transactionId) {
            var modalInstance = $uibModal.open({
            animation: true,
            templateUrl:
                "js/Modal/TransactionUpdateNotes2Modal/TransactoionUpdateNote2Modal.template.html?v=1",
            controller: "transactionUpdateNotes2ModalCtrl",
            size: "md",
            scope: $scope,
            resolve: {
                dataParam: function () {
                return {notes2,futureId,transactionId};
                },
            },
            });
            modalInstance.result.then(
            function (returnValue) {
                var data = {
                    id: futureId,
                    notes: returnValue.notes2,
                    history: $scope.filter.history,
                  };
                var jsonData = CRYPTO.encrypt(data);
                $http({
                  method: "POST",
                  url: webservicesUrl + "/transactionUpdateNotes2ById.php",
                  data: { 'data': jsonData },
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                }).then(
                    function mySuccess(response) {
                      var data = CRYPTO.decrypt(response.data.data);
                      // var data = response.data.data;
                      console.log(data);
                      if (data.status.toLowerCase() == "ok") {
                        alert("Success!");
                        $scope.getListData();
                      } else {
                        console.log(data.message);
                        alert(data.message);
                      }
                    },
                    function myError(response) {
                      console.log(response);
                    }
                  );
        }
        );
        };
  
        $scope.getListData = function () {
            if ($scope.filter.transId == "") {
            alert("Please Input Transaction Id");
            return false;
            }
    
            var data = {
            transId: $scope.filter.transId,
            history: $scope.filter.history,
            };
            var jsonData = CRYPTO.encrypt(data);
    
            $scope.gridIsLoading = true;
            $http({
            method: "POST",
            url: webservicesUrl + "/transactionById_getList.php",
            data: { data: jsonData },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            }).then(
            function mySuccess(response) {
                $scope.gridIsLoading = false;
                //$scope.getAccountBalance();
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == "ok") {
                data.records = $scope.urlDecode(data.records);
    
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
  
        $scope.init = function () {
            //$scope.getListAccount();
            //$scope.getListData();
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
  
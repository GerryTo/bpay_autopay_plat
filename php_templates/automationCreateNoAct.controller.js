app.controller("automationCreateNoActCtrl", [
    "$state",
    "$scope",
    "$http",
    "$timeout",
    "$uibModal",
    "uiGridConstants",
    function ($state, $scope, $http, $timeout, uiGridConstants, $uibModal) {
        //$scope.products = [];
        $scope.gridIsLoading = false;

        $scope.gridOptions = {
            showGridFooter: true,
            enableSorting: true,
            showColumnFooter: true,
            enableColumnResizing: true,
            enableGridMenu: true,
            exporterExcelFilename: "AutomationCreate.xlsx",
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
                { name: "System", field: "system" },
                { name: "OTP Status", 
                  field: "statusDesOtpSender" ,
                  cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.statusDesOtpSender === 'ONLINE' ? 'green' : 'red'}">
                            {{row.entity.statusDesOtpSender}}
                         </div>`,
                },
                {
                    name: "status(online/offline)",
                    field: "isOnline",
                    cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.isOnline === 'ONLINE' ? 'green' : 'red'}">
                            {{row.entity.isOnline}}
                         </div>`,
                },
                {
                    name: "OTP Code(Receive/Not Receive)",
                    field: "otperror",
                    cellTemplate: `<div class="ui-grid-cell-contents" ng-style="{'backgroundColor': row.entity.otperror === 'Receive' ? 'green' : 'red'}">
                            {{row.entity.otperror}}
                         </div>`,
                },
                { name: "Pin", field: "pin" },
                { name: "Serial Number", field: "serialNumber" },
                { name: "Server Name", field: "serverName" },
                // { name: 'Current Balance', field: 'newbalance',cellFilter: 'number: 2', cellClass: 'grid-alignright', type:'number' },
                // {
                //     name: 'Action', field: 'merchantcode',
                //     cellTemplate: '<button type="button" class="btn btn-primary btn-sm" ng-click="grid.appScope.edit(row.entity)">' + $scope.globallang.edit + '</button>'
                // }
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
                url: webservicesUrl + "/automationCreate_getList.php",
                data: { data: "" },
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
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
                };
                $http({
                    method: "post",
                    url: webservicesUrl + "/automationCreate_create.php",
                    data: { data: params },
                    Headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                }).then(
                    function mySuccess(response) {
                        $scope.gridIsLoading = false;
                        var data = response.data;
                        if (data.message == "success add automation accounnt") {
                            alert("success add automation accounnt");
                        } else {
                            alert(data.message);
                        }
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

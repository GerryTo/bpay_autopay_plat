app.controller('cpJournalPageCtrl', ['$state', '$scope', '$http', '$timeout', '$uibModal', '$stateParams', 'uiGridConstants', function ($state, $scope, $http, $timeout, $uibModal, $stateParams, uiGridConstants) {

    $scope.datepickerConfig = {
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'],
        format: 'dd-MMMM-yyyy',
        altInputFormats: ['M!/d!/yyyy']
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        maxDate: new Date(),
        startingDay: 1
    };
    $scope.popup1 = {
        opened: false
    };
    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };
    $scope.filterdate = new Date();
    //$scope.products = [];
    $scope.gridIsLoading = false;
    $scope.getHeight = function () {
        return window.innerHeight - 180;
    }
    $scope.gridOptions = {
        enableSorting: true,
        showColumnFooter: true,
        enableColumnResizing: true,
        enableGridMenu: true,
        enableFiltering: true,
        rowTemplate: 'templates/rowTemplate.html',
        columnDefs: [
            { name: 'Timestamp (GMT +8)', field: 'adjusted_time', width: '150' },
            { name: 'Timestamp', field: 'insert', width: '150' },
            { name: 'User', field: 'user', width: '100' },
            { name: 'Description', field: 'desc' },
            { name: 'IP', field: 'ip', width: '150' }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        data: []
    };

    $scope.refresh = function () {
        $scope.getListData();
    }

    $scope.getListData = function () {
        var from = $scope.convertJsDateToString($scope.filterdate) + ' 00:00:00';
        var data = { 'filterdate': from };
        var jsonData = CRYPTO.encrypt(data);
        $scope.gridIsLoading = true;
        $http({
            method: "POST",
            url: webservicesUrl + "/getCPJournal.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            $scope.gridIsLoading = false;
            var data = CRYPTO.decrypt(response.data.data);
            console.log(data);
            if (data.status.toLowerCase() == 'ok') {
                data.records = $scope.urlDecode(data.records);
                $scope.gridOptions.data = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            $scope.gridIsLoading = false;
            console.log(response);
        });
    }

    $scope.init = function () {
        $scope.getListData();
    }
    $scope.init();
}]);

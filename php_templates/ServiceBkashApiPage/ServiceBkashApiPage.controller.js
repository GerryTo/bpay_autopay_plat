app.controller("serviceBkashAPICtrl", [
  "$state",
  "$scope",
  "$http",
  "$timeout",
  "uiGridConstants",
  "$stateParams",
  "$uibModal",
  "$interval",
  "$rootScope",
  function (
    $state,
    $scope,
    $http,
    $timeout,
    uiGridConstants,
    $stateParams,
    $uibModal,
    $interval,
    $rootScope
  ) {
    $scope.gridIsLoading = false;
    $scope.selectedRows = [];

    // Batch config
    $scope.batchSize = 25;
    $scope.batchDelay = 1000;

    $scope.bulkProgress = {
      isRunning: false,
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: 0,
    };

    $scope.gridOptions = {
      enableSorting: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,

      // ✅ selection SAME as NAGAD
      enableRowSelection: true,
      enableSelectAll: true,
      selectionRowHeaderWidth: 35,
      rowHeight: 35,

      rowTemplate: "templates/rowTemplate.html",

      columnDefs: [
        { name: "User", field: "v_mainuser" },
        {
          name: "Action",
          width: 250,
          enableFiltering: false,
          cellTemplate:
            '<button class="btn btn-warning btn-sm" ng-click="grid.appScope.ExecuteService(row.entity,1)">RESTART</button> ' +
            '<button class="btn btn-primary btn-sm" ng-click="grid.appScope.ExecuteService(row.entity,2)">START</button> ' +
            '<button class="btn btn-danger btn-sm" ng-click="grid.appScope.ExecuteService(row.entity,3)">STOP</button>',
        },
      ],

      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;

        // ✅ ini WAJIB agar bulk jalan
        gridApi.selection.on.rowSelectionChanged($scope, function () {
          $scope.selectedRows = gridApi.selection.getSelectedRows();
        });

        gridApi.selection.on.rowSelectionChangedBatch($scope, function () {
          $scope.selectedRows = gridApi.selection.getSelectedRows();
        });
      },

      data: [],
    };

    function getStatementFromStatus(status) {
      if (status == 1) return "restart";
      if (status == 2) return "start";
      if (status == 3) return "stop";
      return "";
    }

    // =========================
    // SINGLE SERVICE
    // =========================
    $scope.ExecuteService = function (data, status) {
      var stmt = getStatementFromStatus(status);

      var payload = {
        statment: stmt,
        servicename: data.v_mainuser,
      };

      $scope.gridIsLoading = true;

      $http
        .post(
          webservicesUrl + "/executeServiceBkashAPI.php",
          { data: payload },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }
        )
        .then(
          function (res) {
            $scope.gridIsLoading = false;
            alert(res.data.message);
            $scope.getListData();
          },
          function () {
            $scope.gridIsLoading = false;
            alert("Request failed");
          }
        );
    };

    // =========================
    // BULK SERVICE
    // =========================
    $scope.ExecuteBulkService = function (status) {
      if ($scope.selectedRows.length === 0) {
        alert("Please select at least one service");
        return;
      }

      var stmt = getStatementFromStatus(status);
      var total = $scope.selectedRows.length;
      var totalBatches = Math.ceil(total / $scope.batchSize);

      if (
        !confirm(
          "Are you sure want to " +
            stmt.toUpperCase() +
            " " +
            total +
            " service(s)?\n\nBatch: " +
            totalBatches
        )
      ) {
        return;
      }

      $scope.bulkProgress = {
        isRunning: true,
        total: total,
        processed: 0,
        success: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: totalBatches,
      };

      $scope.gridIsLoading = true;

      var batches = [];
      for (var i = 0; i < total; i += $scope.batchSize) {
        batches.push($scope.selectedRows.slice(i, i + $scope.batchSize));
      }

      processBatch(batches, stmt, 0);
    };

    function processBatch(batches, stmt, index) {
      if (index >= batches.length) {
        onBulkComplete(stmt);
        return;
      }

      $scope.bulkProgress.currentBatch = index + 1;
      var promises = [];

      angular.forEach(batches[index], function (row) {
        promises.push(
          $http
            .post(
              webservicesUrl + "/executeServiceBkashAPI.php",
              {
                data: {
                  statment: stmt,
                  servicename: row.v_mainuser,
                },
              },
              {
                headers: {
                  "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                },
              }
            )
            .then(
              function (res) {
                $scope.bulkProgress.processed++;
                res.data.status === "success"
                  ? $scope.bulkProgress.success++
                  : $scope.bulkProgress.failed++;
              },
              function () {
                $scope.bulkProgress.processed++;
                $scope.bulkProgress.failed++;
              }
            )
        );
      });

      Promise.all(promises).then(function () {
        $timeout(function () {
          processBatch(batches, stmt, index + 1);
        }, $scope.batchDelay);
      });
    }

    function onBulkComplete(stmt) {
      $scope.gridIsLoading = false;
      $scope.bulkProgress.isRunning = false;

      alert(
        "Bulk " +
          stmt.toUpperCase() +
          " completed\n\nSuccess: " +
          $scope.bulkProgress.success +
          "\nFailed: " +
          $scope.bulkProgress.failed
      );

      $scope.gridApi.selection.clearSelectedRows();
      $scope.selectedRows = [];
      $scope.getListData();
    }

    // =========================
    // LOAD DATA
    // =========================
    $scope.getListData = function () {
      $scope.gridIsLoading = true;

      $http
        .post(
          webservicesUrl + "/GetServiceBkashAPI.php",
          {},
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
          }
        )
        .then(
          function (res) {
            $scope.gridIsLoading = false;
            if (res.data.status === "success") {
              $scope.gridOptions.data = res.data.records;
            }
          },
          function () {
            $scope.gridIsLoading = false;
          }
        );
    };

    $scope.init = function () {
      $scope.getListData();
    };

    $scope.init();
  },
]);

app.controller('serviceNagadAPICtrl', ['$state', '$scope', '$http', '$timeout', 'uiGridConstants', '$stateParams', '$uibModal',
  '$interval', '$rootScope',
  function ($state, $scope, $http, $timeout, uiGridConstants, $stateParams, $uibModal, $interval, $rootScope) {

    $scope.gridIsLoading = false;
    $scope.selectedRows = [];

    // Batch configuration
    $scope.batchSize = 25;
    $scope.batchDelay = 1000; // 1 second delay between batches
    $scope.bulkProgress = {
      isRunning: false,
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches: 0
    };

    $scope.gridOptions = {
      enableSorting: true,
      showColumnFooter: true,
      enableFiltering: true,
      enableGridMenu: true,
      enableColumnResizing: true,
      enableRowSelection: true,
      enableSelectAll: true,
      selectionRowHeaderWidth: 35,
      rowHeight: 35,
      rowTemplate: 'templates/rowTemplate.html',
      columnDefs: [
        { name: 'User', field: 'v_user' },
        { name: 'Counter', field: 'v_atc' },
        { name: 'Session ID', field: 'v_mpaid', width: 300 },
        { name: 'Operator', field: 'v_operator' },
        {
          name: "Action",
          field: "n_id",
          width: 320,
          enableFiltering: false,
          cellTemplate:
            '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.AddCounter(row.entity)" title="Add Counter"> +1 </button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 1)"> RESTART </button>' +
            '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 2)"> START </button>' +
            '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 3)"> STOP </button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        // Track selection changes
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.selectedRows = gridApi.selection.getSelectedRows();
        });
        gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
          $scope.selectedRows = gridApi.selection.getSelectedRows();
        });
      },
      data: [],
    };

    // Single service execution
    $scope.ExecuteService = function (data, status) {
      var stmt = getStatementFromStatus(status);
      var data1 = {
        statment: stmt,
        servicename: data.v_user,
      };

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/executeServiceNagadAPI.php",
        data: { data: data1 },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
        $scope.gridIsLoading = false;
        var data = response.data;
        if (data.status.toLowerCase() == 'success') {
          alert(data.message);
          $scope.getListData();
        } else {
          alert(data.message);
        }
      }, function myError(response) {
        $scope.gridIsLoading = false;
        console.log(response.data.status);
      });
    };

    // Add counter for single row
    $scope.AddCounter = function (data) {
      var data1 = {
        username: data.v_user,
      };

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/addCounterNagadAPI.php",
        data: { data: data1 },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
        $scope.gridIsLoading = false;
        var data = response.data;
        if (data.status.toLowerCase() == 'success') {
          alert(data.message);
          $scope.getListData();
        } else {
          alert(data.message);
        }
      }, function myError(response) {
        $scope.gridIsLoading = false;
        console.log(response.data.status);
      });
    };

    // Bulk add counter
    $scope.AddBulkCounter = function () {
      if ($scope.selectedRows.length === 0) {
        alert('Please select at least one service');
        return;
      }

      var totalRows = $scope.selectedRows.length;
      var totalBatches = Math.ceil(totalRows / $scope.batchSize);
      var confirmMsg = 'Are you sure you want to ADD COUNTER for ' + totalRows + ' service(s)?\n\n' +
        'This will be processed in ' + totalBatches + ' batch(es) of ' + $scope.batchSize + ' with ' + ($scope.batchDelay / 1000) + 's delay between batches.';

      if (!confirm(confirmMsg)) {
        return;
      }

      // Initialize progress
      $scope.bulkProgress = {
        isRunning: true,
        total: totalRows,
        processed: 0,
        success: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: totalBatches
      };
      $scope.gridIsLoading = true;

      // Split rows into batches
      var batches = [];
      for (var i = 0; i < $scope.selectedRows.length; i += $scope.batchSize) {
        batches.push($scope.selectedRows.slice(i, i + $scope.batchSize));
      }

      // Process batches sequentially
      processCounterBatchSequentially(batches, 0);
    };

    // Process counter batches sequentially
    function processCounterBatchSequentially(batches, batchIndex) {
      if (batchIndex >= batches.length) {
        onBulkCounterComplete();
        return;
      }

      $scope.bulkProgress.currentBatch = batchIndex + 1;
      var currentBatch = batches[batchIndex];
      var promises = [];

      angular.forEach(currentBatch, function (row) {
        var data1 = {
          username: row.v_user,
        };

        var promise = $http({
          method: "POST",
          url: webservicesUrl + "/addCounterNagadAPI.php",
          data: { data: data1 },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
          $scope.bulkProgress.processed++;
          if (response.data.status.toLowerCase() == 'success') {
            $scope.bulkProgress.success++;
          } else {
            $scope.bulkProgress.failed++;
          }
        }, function myError(response) {
          $scope.bulkProgress.processed++;
          $scope.bulkProgress.failed++;
        });

        promises.push(promise);
      });

      Promise.all(promises).then(function () {
        if (batchIndex < batches.length - 1) {
          $timeout(function () {
            processCounterBatchSequentially(batches, batchIndex + 1);
          }, $scope.batchDelay);
        } else {
          processCounterBatchSequentially(batches, batchIndex + 1);
        }
      });
    }

    // Called when bulk counter is done
    function onBulkCounterComplete() {
      $scope.gridIsLoading = false;
      $scope.bulkProgress.isRunning = false;

      alert('Bulk ADD COUNTER completed!\n\n' +
        'Total: ' + $scope.bulkProgress.total + '\n' +
        'Success: ' + $scope.bulkProgress.success + '\n' +
        'Failed: ' + $scope.bulkProgress.failed);

      $scope.gridApi.selection.clearSelectedRows();
      $scope.selectedRows = [];
      $scope.getListData();
    }

    // Bulk service execution with batching
    $scope.ExecuteBulkService = function (status) {
      if ($scope.selectedRows.length === 0) {
        alert('Please select at least one service');
        return;
      }

      var stmt = getStatementFromStatus(status);
      var totalRows = $scope.selectedRows.length;
      var totalBatches = Math.ceil(totalRows / $scope.batchSize);
      var confirmMsg = 'Are you sure you want to ' + stmt.toUpperCase() + ' ' + totalRows + ' service(s)?\n\n' +
        'This will be processed in ' + totalBatches + ' batch(es) of ' + $scope.batchSize + ' with ' + ($scope.batchDelay / 1000) + 's delay between batches.';

      if (!confirm(confirmMsg)) {
        return;
      }

      // Initialize progress
      $scope.bulkProgress = {
        isRunning: true,
        total: totalRows,
        processed: 0,
        success: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: totalBatches
      };
      $scope.gridIsLoading = true;

      // Split rows into batches
      var batches = [];
      for (var i = 0; i < $scope.selectedRows.length; i += $scope.batchSize) {
        batches.push($scope.selectedRows.slice(i, i + $scope.batchSize));
      }

      // Process batches sequentially
      processBatchSequentially(batches, stmt, 0);
    };

    // Process each batch with delay
    function processBatchSequentially(batches, stmt, batchIndex) {
      if (batchIndex >= batches.length) {
        // All batches completed
        onBulkComplete(stmt);
        return;
      }

      $scope.bulkProgress.currentBatch = batchIndex + 1;
      var currentBatch = batches[batchIndex];
      var promises = [];

      angular.forEach(currentBatch, function (row) {
        var data1 = {
          statment: stmt,
          servicename: row.v_user,
        };

        var promise = $http({
          method: "POST",
          url: webservicesUrl + "/executeServiceNagadAPI.php",
          data: { data: data1 },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
          $scope.bulkProgress.processed++;
          if (response.data.status.toLowerCase() == 'success') {
            $scope.bulkProgress.success++;
          } else {
            $scope.bulkProgress.failed++;
          }
        }, function myError(response) {
          $scope.bulkProgress.processed++;
          $scope.bulkProgress.failed++;
        });

        promises.push(promise);
      });

      // Wait for current batch to complete, then process next batch after delay
      Promise.all(promises).then(function () {
        if (batchIndex < batches.length - 1) {
          // More batches to process, wait before next batch
          $timeout(function () {
            processBatchSequentially(batches, stmt, batchIndex + 1);
          }, $scope.batchDelay);
        } else {
          // Last batch completed
          processBatchSequentially(batches, stmt, batchIndex + 1);
        }
      });
    }

    // Called when all batches are done
    function onBulkComplete(stmt) {
      $scope.gridIsLoading = false;
      $scope.bulkProgress.isRunning = false;

      alert('Bulk ' + stmt.toUpperCase() + ' completed!\n\n' +
        'Total: ' + $scope.bulkProgress.total + '\n' +
        'Success: ' + $scope.bulkProgress.success + '\n' +
        'Failed: ' + $scope.bulkProgress.failed);

      $scope.gridApi.selection.clearSelectedRows();
      $scope.selectedRows = [];
      $scope.getListData();
    }

    // Cancel bulk operation
    $scope.cancelBulkOperation = function () {
      $scope.bulkProgress.isRunning = false;
      $scope.gridIsLoading = false;
      alert('Bulk operation cancelled. Some requests may have already been processed.');
    };

    // Helper function to get statement from status
    function getStatementFromStatus(status) {
      if (status == 1) return 'restart';
      if (status == 2) return 'start';
      if (status == 3) return 'stop';
      return '';
    }

    $scope.getListData = function () {
      var data = {};

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetServiceNagadAPI.php",
        data: data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function mySuccess(response) {
        $scope.gridIsLoading = false;
        var data = response.data;

        if (data.status.toLowerCase() == 'success') {
          $scope.gridOptions.data = data.records;
        } else {
          alert(data.message);
        }
      }, function myError(response) {
        $scope.gridIsLoading = false;
        console.log(response.status);
      });
    };

    $scope.refresh = function () {
      $scope.getListData();
    };

    $scope.init = function () {
      $scope.getListData();
    };
    $scope.init();
  }]);
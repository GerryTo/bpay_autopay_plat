app.controller("serviceNagadAPICtrl", [
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
      totalBatches: 0,
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
      rowTemplate: "templates/rowTemplate.html",
      columnDefs: [
        { name: "User", field: "v_user" },
        { name: "Counter", field: "v_atc" },
        { name: "Session ID", field: "v_mpaid", width: 300 },
        { name: "Operator", field: "v_operator" },
        {
          name: "Action",
          field: "n_id",
          width: 360,
          enableFiltering: false,
          cellTemplate:
            '<button type="button" class="btn btn-success btn-sm" style="margin-right:2px;" ng-click="grid.appScope.AddCounter(row.entity)" title="Add Counter"> +1 </button>' +
            '<button type="button" class="btn btn-warning btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 1)"> RESTART </button>' +
            '<button type="button" class="btn btn-primary btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 2)"> START </button>' +
            '<button type="button" class="btn btn-danger btn-sm" style="margin-right:2px;" ng-click="grid.appScope.ExecuteService(row.entity, 3)"> STOP </button>' +
            '<button type="button" class="btn btn-danger btn-sm" ng-click="grid.appScope.DeleteSession(row.entity)" title="Hapus Session"><i class="fa fa-trash"></i></button>',
        },
      ],
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "success") {
            alert(data.message);
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.data.status);
        }
      );
    };

    // Delete Session
    $scope.DeleteSession = function (data) {
      if (
        !confirm(
          "Are you sure you want to delete the MPAID for the user " +
            data.v_user +
            "?"
        )
      ) {
        return;
      }

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/deleteNagadAPI.php",
        data: { v_mpaid: data.v_mpaid },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "success") {
            alert(data.message);
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.data.status);
        }
      );
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
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;
          if (data.status.toLowerCase() == "success") {
            alert(data.message);
            $scope.getListData();
          } else {
            alert(data.message);
          }
        },
        function myError(response) {
          $scope.gridIsLoading = false;
          console.log(response.data.status);
        }
      );
    };

    // Bulk add counter
    $scope.AddBulkCounter = function () {
      if ($scope.selectedRows.length === 0) {
        alert("Please select at least one service");
        return;
      }

      var totalRows = $scope.selectedRows.length;
      var totalBatches = Math.ceil(totalRows / $scope.batchSize);
      var confirmMsg =
        "Are you sure you want to ADD COUNTER for " +
        totalRows +
        " service(s)?\n\n" +
        "This will be processed in " +
        totalBatches +
        " batch(es) of " +
        $scope.batchSize +
        " with " +
        $scope.batchDelay / 1000 +
        "s delay between batches.";

      if (!confirm(confirmMsg)) {
        return;
      }

      $scope.bulkProgress = {
        isRunning: true,
        total: totalRows,
        processed: 0,
        success: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: totalBatches,
      };
      $scope.gridIsLoading = true;

      var batches = [];
      for (var i = 0; i < $scope.selectedRows.length; i += $scope.batchSize) {
        batches.push($scope.selectedRows.slice(i, i + $scope.batchSize));
      }

      processCounterBatchSequentially(batches, 0);
    };

    function processCounterBatchSequentially(batches, batchIndex) {
      if (batchIndex >= batches.length) {
        onBulkCounterComplete();
        return;
      }

      $scope.bulkProgress.currentBatch = batchIndex + 1;
      var currentBatch = batches[batchIndex];
      var promises = [];

      angular.forEach(currentBatch, function (row) {
        var data1 = { username: row.v_user };

        var promise = $http({
          method: "POST",
          url: webservicesUrl + "/addCounterNagadAPI.php",
          data: { data: data1 },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.bulkProgress.processed++;
            if (response.data.status.toLowerCase() == "success") {
              $scope.bulkProgress.success++;
            } else {
              $scope.bulkProgress.failed++;
            }
          },
          function myError(response) {
            $scope.bulkProgress.processed++;
            $scope.bulkProgress.failed++;
          }
        );

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

    function onBulkCounterComplete() {
      $scope.gridIsLoading = false;
      $scope.bulkProgress.isRunning = false;

      alert(
        "Bulk ADD COUNTER completed!\n\n" +
          "Total: " +
          $scope.bulkProgress.total +
          "\n" +
          "Success: " +
          $scope.bulkProgress.success +
          "\n" +
          "Failed: " +
          $scope.bulkProgress.failed
      );

      $scope.gridApi.selection.clearSelectedRows();
      $scope.selectedRows = [];
      $scope.getListData();
    }

    // Bulk service execution with batching
    $scope.ExecuteBulkService = function (status) {
      if ($scope.selectedRows.length === 0) {
        alert("Please select at least one service");
        return;
      }

      var stmt = getStatementFromStatus(status);
      var totalRows = $scope.selectedRows.length;
      var totalBatches = Math.ceil(totalRows / $scope.batchSize);
      var confirmMsg =
        "Are you sure you want to " +
        stmt.toUpperCase() +
        " " +
        totalRows +
        " service(s)?\n\n" +
        "This will be processed in " +
        totalBatches +
        " batch(es) of " +
        $scope.batchSize +
        " with " +
        $scope.batchDelay / 1000 +
        "s delay between batches.";

      if (!confirm(confirmMsg)) {
        return;
      }

      $scope.bulkProgress = {
        isRunning: true,
        total: totalRows,
        processed: 0,
        success: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches: totalBatches,
      };
      $scope.gridIsLoading = true;

      var batches = [];
      for (var i = 0; i < $scope.selectedRows.length; i += $scope.batchSize) {
        batches.push($scope.selectedRows.slice(i, i + $scope.batchSize));
      }

      processBatchSequentially(batches, stmt, 0);
    };

    function processBatchSequentially(batches, stmt, batchIndex) {
      if (batchIndex >= batches.length) {
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
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }).then(
          function mySuccess(response) {
            $scope.bulkProgress.processed++;
            if (response.data.status.toLowerCase() == "success") {
              $scope.bulkProgress.success++;
            } else {
              $scope.bulkProgress.failed++;
            }
          },
          function myError(response) {
            $scope.bulkProgress.processed++;
            $scope.bulkProgress.failed++;
          }
        );

        promises.push(promise);
      });

      Promise.all(promises).then(function () {
        if (batchIndex < batches.length - 1) {
          $timeout(function () {
            processBatchSequentially(batches, stmt, batchIndex + 1);
          }, $scope.batchDelay);
        } else {
          processBatchSequentially(batches, stmt, batchIndex + 1);
        }
      });
    }

    function onBulkComplete(stmt) {
      $scope.gridIsLoading = false;
      $scope.bulkProgress.isRunning = false;

      alert(
        "Bulk " +
          stmt.toUpperCase() +
          " completed!\n\n" +
          "Total: " +
          $scope.bulkProgress.total +
          "\n" +
          "Success: " +
          $scope.bulkProgress.success +
          "\n" +
          "Failed: " +
          $scope.bulkProgress.failed
      );

      $scope.gridApi.selection.clearSelectedRows();
      $scope.selectedRows = [];
      $scope.getListData();
    }

    $scope.openStartAgentModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: "templates/startAgent.html",
        controller: "StartAgentModalCtrl",
        size: "sm",
      });

      modalInstance.result.then(
        function () {
          $scope.getListData(); // refresh grid
        },
        function () {
          console.log("Start Agent modal dismissed");
        }
      );
    };

    $scope.cancelBulkOperation = function () {
      $scope.bulkProgress.isRunning = false;
      $scope.gridIsLoading = false;
      alert(
        "Bulk operation cancelled. Some requests may have already been processed."
      );
    };

    function getStatementFromStatus(status) {
      if (status == 1) return "restart";
      if (status == 2) return "start";
      if (status == 3) return "stop";
      return "";
    }

    $scope.getListData = function () {
      var data = {};

      $scope.gridIsLoading = true;
      $http({
        method: "POST",
        url: webservicesUrl + "/GetServiceNagadAPI.php",
        data: data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function mySuccess(response) {
          $scope.gridIsLoading = false;
          var data = response.data;

          if (data.status.toLowerCase() == "success") {
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

app.controller("StartAgentModalCtrl", [
  "$scope",
  "$uibModalInstance",
  "$http",
  function ($scope, $uibModalInstance, $http) {
    $scope.form = {
      servicename: "",
      action: "start",
    };

    $scope.execute = function () {
      var payload = {
        statment: $scope.form.action,
        servicename: $scope.form.servicename,
      };

      $http({
        method: "POST",
        url: webservicesUrl + "/executeServiceNagadAPI.php",
        data: { data: payload },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }).then(
        function success(response) {
          if (response.data.status.toLowerCase() === "success") {
            alert(response.data.message);
            $uibModalInstance.close(true);
          } else {
            alert(response.data.message);
          }
        },
        function error() {
          alert("Failed to execute agent");
        }
      );
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss("cancel");
    };
  },
]);

app.controller('masterDashboardMerchantCtrl', [
  '$state', '$scope', '$http', '$timeout', 'uiGridConstants',
  function ($state, $scope, $http, $timeout, uiGridConstants) {

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

    $scope.popup1 = { opened: false };
    $scope.popup2 = { opened: false };
    $scope.open1 = () => $scope.popup1.opened = true;
    $scope.open2 = () => $scope.popup2.opened = true;

    $scope.filter = {
      fromdate: new Date(),
      todate: new Date(),
      merchantCode: 'ALL'
    };

    $scope.merchantList = [];
    $scope.dataSummary = [];
    $scope.gridIsLoading = false;

    // ambil list merchant
    $scope.getMerchantList = function () {
      $http({
        method: 'POST',
        url: webservicesUrl + '/masterMerchant_getList.php',
        data: { data: '' },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function (response) {
        var data = CRYPTO.decrypt(response.data.data);
        if (data.status.toLowerCase() == 'ok') {
          $scope.merchantList = data.records;
          $scope.merchantList.push({ merchantcode: 'ALL' });
        } else {
          alert(data.message);
        }
      });
    };

    // ambil data summary per merchant
    $scope.getSumData = function () {
      var from = $scope.convertJsDateToString($scope.filter.fromdate) + ' 00:00:00';
      var to = $scope.convertJsDateToString($scope.filter.todate) + ' 23:59:59';
      var merchantcode = $scope.filter.merchantCode;

      var data = { datefrom: from, dateto: to, merchantcode: merchantcode };
      var jsonData = CRYPTO.encrypt(data);

      $scope.gridIsLoading = true;
      $http({
        method: 'POST',
        url: webservicesUrl + '/getDashboardMerchant.php',
        data: { data: jsonData },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
      }).then(function (response) {
        var data = response.data;
        if (data.status.toLowerCase() == 'ok') {
          $scope.dataSummary = data.records;
          $scope.calculateTotals();
        } else {
          alert(data.message);
        }
        $scope.gridIsLoading = false;
      }, function () {
        $scope.gridIsLoading = false;
      });
    };
    $scope.totalAllDeposit = 0;
    $scope.totalAllWithdraw = 0;

    $scope.calculateTotals = function () {
      let dep = 0, wd = 0;
      $scope.dataSummary.forEach(item => {
        dep += Number(item.total_deposit || 0);
        wd  += Number(item.total_withdraw || 0);
      });
      $scope.totalAllDeposit = dep;
      $scope.totalAllWithdraw = wd;
    };


    $scope.convertJsDateToString = function (dateObj) {
      if (!dateObj) return '';
      var d = new Date(dateObj);
      var month = '' + (d.getMonth() + 1);
      var day = '' + d.getDate();
      var year = d.getFullYear();
      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    };

    $scope.refresh = function () {
      $scope.getSumData();
    };

    $scope.init = function () {
      $scope.getMerchantList();
      $scope.getSumData();
    };

    $scope.init();
  }
]);

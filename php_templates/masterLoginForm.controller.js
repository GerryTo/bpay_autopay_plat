app.controller('masterLoginFormCtrl', ['$state', '$scope', '$http', '$timeout', '$stateParams', function ($state, $scope, $http, $timeout, $stateParams) {

    $scope.data = {
        login: '',
        password: '',
        active: '',
        logintype: '',
        access: 0,
        merchantcode: '',
        phoneNumber: '',
        agentName: '',
        alias: '',
        status: "1",
        agentgroupid: "0",
        isNew: "1",
        useCredit: "Y",
        isdm: "N",
        isSetMerchant: "N",
        provider: ''
    }

    $scope.merchantlist = [];
    $scope.menunav = [];
    $scope.access = [];
    $scope.itemhide = [];
    $scope.isMerchant = false;
    $scope.listLoginStatus = [];
    $scope.agentGroupList = [];

    $scope.currentLoginInfo = {};

    $scope.loginTypeList = [{ value: 'S', display: 'Super Admin' }, { value: 'A', display: 'Admin' }, { value: 'M', display: 'Merchant' }, { value: 'R', display: 'Reseller' }, { value: 'G', display: 'Agent' }];

    $scope.save = function () {

        if ($scope.data.logintype != 'M') {
            $scope.data.merchantcode = '';
        } else {
            if (typeof $scope.data.merchantcode === 'undefined' || $scope.data.merchantcode == '') {
                alert('Please select merchant code');
                return false;
            }
        }

        var jsonData = CRYPTO.encrypt($scope.data);
        if ($scope.data.login == '') {
            alert('Please input login');
            return false;
        }
        if (confirm("Are you sure want to save ?") == true) {
            $http({
                method: "POST",
                url: webservicesUrl + "/saveLogin.php",
                data: { 'data': jsonData },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
            }).then(function mySuccess(response) {
                var data = CRYPTO.decrypt(response.data.data);
                if (data.status.toLowerCase() == 'ok') {
                    alert('Data Saved');
                    $state.go('login-list');
                } else {
                    alert(data.message);
                }
            }, function myError(response) {
                console.log(response);
            });
        }
    }

    $scope.cancel = function () {
        $state.go('login-list');
    }
    $scope.menuClick = function (val, idx) {
        if ($scope.access[idx]) {
            $scope.data.access += Number(val.menuid);
        } else {
            $scope.data.access -= Number(val.menuid);
        }
    }
    $scope.changeType = function () {
        if ($scope.data.logintype == 'A' || $scope.data.logintype == 'S') {
            $scope.data.access = 3191;
            $scope.itemhide[0] = false;
            $scope.itemhide[1] = false;
            $scope.itemhide[2] = false;
            $scope.itemhide[3] = true;
            $scope.itemhide[4] = false;
            $scope.itemhide[5] = false;
            $scope.itemhide[6] = false;
            $scope.itemhide[7] = true;
            $scope.itemhide[8] = true;
            $scope.itemhide[9] = true;
            $scope.itemhide[10] = false;
            $scope.itemhide[11] = false;
            $scope.itemhide[12] = false;
            $scope.itemhide[13] = false;
        } else if ($scope.data.logintype == 'M') {
            $scope.data.access = 520;
            $scope.itemhide[0] = true;
            $scope.itemhide[1] = true;
            $scope.itemhide[2] = true;
            $scope.itemhide[3] = false;
            $scope.itemhide[4] = true;
            $scope.itemhide[5] = true;
            $scope.itemhide[6] = true;
            $scope.itemhide[7] = true;
            $scope.itemhide[8] = true;
            $scope.itemhide[9] = false;
            $scope.itemhide[10] = true;
            $scope.itemhide[11] = true;
            $scope.itemhide[12] = false;
            $scope.itemhide[13] = true;
        } else if ($scope.data.logintype == 'R') {
            $scope.data.access = 896;
            $scope.itemhide[0] = true;
            $scope.itemhide[1] = true;
            $scope.itemhide[2] = true;
            $scope.itemhide[3] = true;
            $scope.itemhide[4] = true;
            $scope.itemhide[5] = true;
            $scope.itemhide[6] = true;
            $scope.itemhide[7] = false;
            $scope.itemhide[8] = false;
            $scope.itemhide[9] = false;
            $scope.itemhide[10] = true;
            $scope.itemhide[11] = true;
            $scope.itemhide[12] = true;
            $scope.itemhide[13] = true;
        } else if ($scope.data.logintype == 'G') {
            $scope.data.access = 0;
            $scope.itemhide[0] = true;
            $scope.itemhide[1] = true;
            $scope.itemhide[2] = true;
            $scope.itemhide[3] = true;
            $scope.itemhide[4] = true;
            $scope.itemhide[5] = true;
            $scope.itemhide[6] = true;
            $scope.itemhide[7] = true;
            $scope.itemhide[8] = true;
            $scope.itemhide[9] = true;
            $scope.itemhide[10] = true;
            $scope.itemhide[11] = true;
            $scope.itemhide[12] = true;
            $scope.itemhide[13] = true;
        }
    }
    $scope.checkedMenu = function (val) {
        if ($scope.data.access & Number(val.menuid)) {
            return true;
        } else {
            return false;
        }
    }

    //-------GET OTHER MASTER------------------
    $scope.getMasterMerchant = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMasterMerchantList.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.merchantlist = data.records;
                // if( data.merchantcode.length > 1 ) {
                //     $scope.data.merchantcode= data.merchantcode;
                //     $scope.data.logintype='M';
                //     $scope.isMerchant=true;
                // }
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    $scope.getMenuNav = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/getMenuNav.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);

            if (data.status.toLowerCase() == 'ok') {

                let tmplist = [];
                for (let i = 0; i < data.records.length; i++) {
                    if (data.records[i].active == 'Yes') {
                        tmplist.push(data.records[i]);
                    }
                }

                $scope.menunav = tmplist;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }
    $scope.getAgentGroup = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/agentgroup/list.php",
            data: { 'searchkey': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            // var data = CRYPTO.decrypt(response.data.data);
            let data = response.data;
            if (data.status.toLowerCase() == 'success') {
                $scope.agentGroupList = data.data;

            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });
    }


    $scope.validateNumberOnly = function (event) {
        console.log(event.keyCode);
    }
    $scope.getTypeLogin = function (item) {
        val = item;
        //alert(val);
        var jsonData = CRYPTO.encrypt(val);
        $http({
            method: "POST",
            url: webservicesUrl + "/getMenuNavDynamic.php",
            data: { 'data': jsonData },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.menunav = data.records;
            } else {
                alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });

    }
    $scope.getLoginStatusList = function () {
        $http({
            method: "POST",
            url: webservicesUrl + "/masterLoginForm_getLoginStatusList.php",
            data: { 'data': '' },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
        }).then(function mySuccess(response) {
            var data = CRYPTO.decrypt(response.data.data);
            if (data.status.toLowerCase() == 'ok') {
                $scope.listLoginStatus = data.records;
            } else {
                //alert(data.message);
            }
        }, function myError(response) {
            console.log(response);
        });

    }
    $scope.init = function () {
        $scope.data.isNew = "1";
        if ($stateParams.data != null) {
            $scope.data.login = $stateParams.data.login;
            $scope.data.active = $stateParams.data.active;
            $scope.data.provider = $stateParams.data.provider ? $stateParams.data.provider : "";
            $scope.data.isSetMerchant = $stateParams.data.issetmerchant ? $stateParams.data.issetmerchant : "N";
            $scope.data.merchantcode = $stateParams.data.merchantcode;
            $scope.data.logintype = $stateParams.data.logintype;
            $scope.changeType();
            $scope.data.access = Number($stateParams.data.menuaccess);
            $scope.data.phoneNumber = $stateParams.data.phoneNumber ? $stateParams.data.phoneNumber : "";
            $scope.data.agentName = $stateParams.data.agentName ? $stateParams.data.agentName : "";
            $scope.data.alias = $stateParams.data.alias ? $stateParams.data.alias : "";
            $scope.data.status = $stateParams.data.status ? $stateParams.data.status : "";
            $scope.data.agentgroupid = $stateParams.data.agentgroupid ? $stateParams.data.agentgroupid : "";
            $scope.data.isNew = $stateParams.data.login ? "0" : "1";
            $scope.data.useCredit = $stateParams.data.useCredit ? $stateParams.data.useCredit : "Y";
            $scope.data.isdm = $stateParams.data.isdm ? $stateParams.data.isdm : "N";
        } else {
            $state.go('login-list');
        }

        var info = localStorage.getItem('bropay-login-info');
        if (info) {
            try {
                $scope.currentLoginInfo = JSON.parse(info);
            } catch (err) { }
        }

        if ($scope.currentLoginInfo.type != 'S') {
            $scope.loginTypeList = [{ value: 'A', display: 'Admin' }, { value: 'M', display: 'Merchant' }, { value: 'R', display: 'Reseller' }, { value: 'G', display: 'Agent' }];
        }

        $scope.getLoginStatusList();
        $scope.getMasterMerchant();
        $scope.getMenuNav();
        $scope.getAgentGroup();
    }
    $scope.init();
}]); 

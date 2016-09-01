/* global angular */

'use strict';

angular.module('stockApp').controller('UsermenuFormCtrl', function($http, $scope, $uibModalInstance, item, $localStorage) {
    var menu_ids = [];

    // $scope.usermenu.menus =  [];

    console.log('item:' + JSON.stringify(item));
    $scope.fname = item.fname;
    var userid = item.id;

    $http.get('/api/menus/' + userid + '?token=' + $localStorage.token).success(function(response) {
        $scope.menus = response.data;
    });

    $scope.usermenu = {
        menus: []
    };



    $scope.save = function() {

        for (var i = 0; i < $scope.usermenu.menus.length; i++) {
            console.log('menu_id:' + $scope.usermenu.menus[i] + ' userid:' + userid);
            var usermenu_temp = {
                'menu_id': $scope.usermenu.menus[i],
                'user_id': userid
            };
            // console.log(usermenu_temp);

            $http.post('/api/usermenus?token=' + $localStorage.token, usermenu_temp).success(function(response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });

        }

    };


    $scope.cancel = function() {
        $uibModalInstance.dismiss('Close');
    };
});


angular.module('stockApp').controller('UsermenuCtrl', function($scope, $http, $uibModal, $localStorage, $log) {
    $scope.menus = [];
    $scope.token = $localStorage.token;
    $scope.alerts = [];
    $scope.rowCount = 0;
    $scope.currentPage = 1;
    $scope.rows = [];
    $scope.sortType = 'login'; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    var gkey = 'key';
    var gvalue = 'value';


    $http.get('/api/users?token=' + $localStorage.token).success(function(response) {
        $scope.users = response;
    });

    initial();

    $scope.changeStatus = function() {
        $http.put('/api/usermenus?token=' + $localStorage.token, this.row).success(function(response) {
            console.log('response from post:' + response);
        });
    };


    $scope.refresh = function() {
        console.log('start refresh');
        initial();
    };

    $scope.delete = function() {
        angular.forEach($scope.rows, function(usermenu) {
            if (usermenu.selected === true) {
                console.log(usermenu);
                $http.delete('/api/usermenus/' + usermenu.id + '?token=' + $localStorage.token).success(function(response) {
                    console.log(response);
                });
            }
        });

        initial();
    };


    $scope.checkAll = function() {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.rows, function(usermenu) {
            usermenu.selected = $scope.selectedAll;
        });

    };

    $scope.create = function() {
        console.log($scope.user);
        if (!$scope.user) {
            $scope.alerts.push({
                msg: "กรุณาเลือกสมาชิกที่ต้องการจะเพิ่มเมนูใช้งานก่อน!"
            });
        } else {
            var user = $scope.user;
            console.log('open from add!');
            var modalInstance = $uibModal.open({
                templateUrl: 'app/usermenu/_form.html',
                controller: 'UsermenuFormCtrl',
                size: 'lg',
                resolve: {
                    item: function() {
                        return user;
                    }
                }
            });

            modalInstance.result.then(function(response) {
                console.log('return close model:' + response);
                initial();
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        }
    };

    $scope.search = function(user) {
        // console.log(user);
        $scope.user = user;
        // var user = $scope.selectedItem;
        $http.get('/api/usermenus/' + user.id + '?token=' + $localStorage.token).success(function(response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    };


    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;

    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
        console.log($scope.sortReverse);
        console.log($scope.sortType);
        $http.get('/api/usermenus/' + gkey + '/' + gvalue + '/' + $scope.currentPage + '/' + $scope.sortType + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function(response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    };


    $scope.sortTypeSelected = function (columnName) {
        $scope.sortType = columnName;
        console.log("before:" + $scope.sortReverse);
        $scope.sortReverse = !$scope.sortReverse;

        console.log("after:" + $scope.sortReverse);
        console.log('Page changed to: ' + $scope.currentPage);

        console.log($scope.sortType);
        $http.get('/api/usermenus/' + gkey
                + '/' + gvalue
                + '/' + $scope.currentPage
                + '/' + $scope.sortType
                + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    };


    function initial() {
        $http.get('/api/usermenus/' + gkey + '/' + gvalue + '/' + $scope.currentPage + '/' + $scope.sortType + '/' + $scope.sortReverse +
            '?token=' + $localStorage.token).success(function(response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    }
});

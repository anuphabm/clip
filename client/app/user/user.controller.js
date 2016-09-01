/* global angular */

'use strict';

angular.module('stockApp').controller('UserCtrl', function ($scope, $http, $uibModal, $localStorage) {
    $scope.rowCount = 0;
    $scope.currentPage = 1;
    $scope.sortType = 'login'; // set the default sort type
    $scope.sortReverse = false;  // set the default sort order
    var gkey = 'key';
    var gvalue = 'value';
    $scope.token = $localStorage.token;

    initial();

    function initial() {
        console.log('start function initial()');
        $http.get('/api/users/'
                + gkey + '/'
                + gvalue + '/'
                + $scope.currentPage + '/'
                + $scope.sortType + '/'
                + $scope.sortReverse + '?token=' + $localStorage.token).success(function (users) {
            $scope.rows = users.data;
            $scope.totalItems = users.totalRows;
        });

    }

    $scope.delete = function () {
//        console.log($scope.rows);
        angular.forEach($scope.rows, function (user) {
            if (user.selected === true) {
                console.log(user);
                $http.delete('/api/users/' + user.id + '?token=' + $localStorage.token).success(function (response) {
                    console.log(response);
                });
            }
        });
        initial();
    };


    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.rows, function (user) {
            user.selected = $scope.selectedAll;
        });

    };

    $scope.edit = function () {
        console.log(this.row);
        var user = this.row;

        var modalInstance = $uibModal.open({
            templateUrl: 'app/user/_form.html',
            controller: 'UserFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return user;
                }
            }
        });
        modalInstance.result.then(function (response) {
            console.log('return close model:' + response);
            initial();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });


    };

    $scope.create = function () {
        var user = null;
        console.log('open from add!');
        var modalInstance = $uibModal.open({
            templateUrl: 'app/user/_form.html',
            controller: 'UserFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return user;
                }
            }

        });

        modalInstance.result.then(function (response) {
            console.log('return close model:' + response);
            initial();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };


    $scope.searchResult = function (key, value) {
        console.log("key:" + key + " value:" + value);
        if (key === 'login') {
            $scope.search.pass = '';
        } else if (key === 'pass') {
            $scope.search.login = '';
        }
        gkey = key;
        gvalue = value;
        if (value === '') {
            ihitail();
        } else {
            $http.get('/api/uses/'
                    + key + "/"
                    + value + '/'
                    + $scope.currentPage + '/'
                    + $scope.sortType + '/'
                    + $scope.sortReverse + '?token=' + $localStorage.token).success(function (users) {
                $scope.rows = users;
            });
        }

        console.log('Page changed to: ' + $scope.currentPage);
        console.log($scope.sortReverse);
        console.log($scope.sortType);
    };

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;

    };
    $scope.pageChanged = function () {
        console.log('Page changed to: ' + $scope.currentPage);
        console.log($scope.sortReverse);
        console.log($scope.sortType);
        $http.get('/api/users/' + gkey
                + '/' + gvalue
                + '/' + $scope.currentPage
                + '/' + $scope.sortType
                + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (users) {
            $scope.rows = users.data;
            $scope.totalItems = users.totalRows;
        });

    };

    $scope.sortTypeSelected = function (columnName) {
        $scope.sortType = columnName;
        console.log("before:" + $scope.sortReverse);
        $scope.sortReverse = !$scope.sortReverse;

        console.log("after:" + $scope.sortReverse);
        console.log('Page changed to: ' + $scope.currentPage);

        console.log($scope.sortType);
        $http.get('/api/users/' + gkey
                + '/' + gvalue
                + '/' + $scope.currentPage
                + '/' + $scope.sortType
                + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (users) {
            $scope.rows = users.data;
            $scope.totalItems = users.totalRows;
        });
    };

}).controller('UserFormCtrl', function ($http, $scope, $uibModalInstance, item, $localStorage) {

    var command = 'save';
    if (item !== null) {
        $scope.user = item;
        command = 'edit';
    }

    $scope.save = function () {
        console.log($scope.user);
        console.log(command);
        if (command === 'save') {
            $http.post('/api/users?token=' + $localStorage.token, $scope.user).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        } else {
            $http.put('/api/users?token=' + $localStorage.token, $scope.user).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        }

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('Close');
    };

});

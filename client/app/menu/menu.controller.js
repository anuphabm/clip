/* global angular */

'use strict';

angular.module('stockApp').controller('MenuCtrl', function ($scope, $http, $uibModal, $localStorage) {
    $scope.menus = [];
    $scope.token = $localStorage.token;
    
    initial();

    function initial() {
        $http.get('/api/menus?token=' + $localStorage.token).success(function (response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    }

    $scope.delete = function () {
        angular.forEach($scope.rows, function (row) {
            if (row.selected === true) {
                console.log(row);
                $http.delete('/api/menus/' + row.id + '?token=' + $localStorage.token).success(function (response) {
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
        angular.forEach($scope.menus, function (menu) {
            menu.selected = $scope.selectedAll;
        });

    };

    $scope.edit = function () {
        console.log(this.row);
        var menu = this.row;

        var modalInstance = $uibModal.open({
            templateUrl: 'app/menu/_form.html',
            controller: 'MenuFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return menu;
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
        var menu = null;
        console.log('open from add!');
        var modalInstance = $uibModal.open({
            templateUrl: 'app/menu/_form.html',
            controller: 'MenuFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return menu;
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


}).controller('MenuFormCtrl', function ($http, $scope, $uibModalInstance, item, $localStorage) {

    var command = 'save';
    if (item !== null) {
        $scope.menu = item;
        command = 'edit';
    }

    $scope.save = function () {
        console.log($scope.menu);
        console.log(command);
        if (command === 'save') {
            $http.post('/api/menus?token=' + $localStorage.token, $scope.menu).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        } else {
            $http.put('/api/menus?token=' + $localStorage.token, $scope.menu).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        }

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('Close');
    };


});

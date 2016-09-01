/* global angular, $http */

'use strict';

angular.module('stockApp').controller('NewCtrl', function ($scope, $http, $uibModal, $localStorage) {
    $scope.rowCount = 0;
    $scope.currentPage = 1;
    $scope.newpapers = [];
    $scope.sortType = 'stamptime'; // set the default sort type
    $scope.sortReverse = true;  // set the default sort order
    var gkey = 'key';
    var gvalue = 'value';
    $scope.token = $localStorage.token;

    initNewpaper();

    function initNewpaper() {
        $http.get('/api/news/'
                + gkey + '/'
                + gvalue + '/'
                + $scope.currentPage + '/'
                + $scope.sortType + '/'
                + $scope.sortReverse + '?token=' + $localStorage.token).success(function (newpapers) {
            $scope.newpapers = newpapers.rows;
            $scope.totalItems = newpapers.totalRows;
        });

    }

    $scope.delete = function () {
//                console.log($scope.newpapers);
        angular.forEach($scope.newpapers, function (newpaper) {
            if (newpaper.selected === true) {
                console.log(newpaper);
                $http.delete('/api/news/' + newpaper.id + '?token=' + $localStorage.token).success(function (response) {
                    console.log(response);
                });
            }
        });

        initNewpaper();
    };


    $scope.checkAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.newpapers, function (newpaper) {
            newpaper.selected = $scope.selectedAll;
        });

    };

    $scope.editNewpaper = function () {
        console.log(this.newpaper);
        var newpaper = this.newpaper;

        var modalInstance = $uibModal.open({
            templateUrl: 'app/new/_form.html',
            controller: 'NewFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return newpaper;
                }
            }
        });
        modalInstance.result.then(function (response) {
            console.log('return close model:' + response);
            initNewpaper();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });


    };

    $scope.create = function () {
        var newpaper = null;
        console.log('open from add!');
        var modalInstance = $uibModal.open({
            templateUrl: 'app/new/_form.html',
            controller: 'NewFormCtrl',
            size: 'lg',
            resolve: {
                item: function () {
                    return newpaper;
                }
            }

        });

        modalInstance.result.then(function (response) {
            console.log('return close model:' + response);
            initNewpaper();
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };


    $scope.searchResult = function (key, value) {
        console.log("key:" + key + " value:" + value);
        if (key === 'subject') {
            $scope.search.detail = '';
        } else if (key === 'detail') {
            $scope.search.subject = '';
        }
        gkey = key;
        gvalue = value;
        if (value === '') {
            initStock();
        } else {
            $http.get('/api/news/'
                    + key + "/"
                    + value + '/'
                    + $scope.currentPage + '/'
                    + $scope.sortType + '/'
                    + $scope.sortReverse + '?token=' + $localStorage.token).success(function (newpapers) {
                $scope.newpapers = newpapers;
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
        $http.get('/api/news/' + gkey
                + '/' + gvalue
                + '/' + $scope.currentPage
                + '/' + $scope.sortType
                + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (newpapers) {
            $scope.newpapers = newpapers.rows;
            $scope.totalItems = newpapers.totalRows;
        });

    };

    $scope.sortTypeSelected = function (columnName) {
        $scope.sortType = columnName;
        console.log("before:" + $scope.sortReverse);
        $scope.sortReverse = !$scope.sortReverse;

        console.log("after:" + $scope.sortReverse);
        console.log('Page changed to: ' + $scope.currentPage);

        console.log($scope.sortType);
        $http.get('/api/news/' + gkey
                + '/' + gvalue
                + '/' + $scope.currentPage
                + '/' + $scope.sortType
                + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (newpapers) {
            $scope.newpapers = newpapers.rows;
            $scope.totalItems = newpapers.totalRows;
        });
    };

}).controller('NewFormCtrl', function ($http, $scope, $uibModalInstance, item, $localStorage) {

    var command = 'save';
    if (item !== null) {
        $scope.newpaper = item;
        command = 'edit';
    }

    $scope.save = function () {
        console.log($scope.newpaper);
        console.log(command);
        if (command === 'save') {
            $http.post('/api/news?token=' + $localStorage.token, $scope.newpaper).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        } else {
            $http.put('/api/news?token=' + $localStorage.token, $scope.newpaper).success(function (response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        }

    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('Close');
    };

});

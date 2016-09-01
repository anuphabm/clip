/* global angular */

'use strict';

angular.module('stockApp')
        .controller('AstsecCtrl', function ($scope, $http, $localStorage, $state) {

//            console.log($localStorage.token);
//            if(!$localStorage.token){
//                $state.go('main');
//            }

            $scope.rowCount = 0;
            $scope.securitys = [];
            $scope.sortType = 'security_symbol'; // set the default sort type
            $scope.sortReverse = false;  // set the default sort order
            var gkey = 'key';
            var gvalue = 'value';

            initStock();

            function initStock() {
                $http.get('/api/astsecs/'
                        + gkey + '/'
                        + gvalue + '/'
                        + $scope.sortType
                        + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function (securitys) {
                    
                    $scope.securitys = securitys;
                    $scope.totalItems = securitys.length;
                });
            }
            

            $scope.refreshData = function () {
                console.log('refresh!');
                $scope.rowCount = 0;
                $scope.securitys = [];
                $scope.sortType = 'security_symbol'; // set the default sort type
                $scope.sortReverse = false;  // set the default sort order
                $scope.search.symbol = '';
                $scope.search.pbv = '';
                $scope.search.bookValue = '';
                $scope.search.eps = '';
                gkey = 'key';
                gvalue = 'value';

                initStock();
            };

            $scope.searchResult = function (key, value) {
                console.log("key:" + key + " value:" + value);
                if (key === 'symbol') {
                    $scope.search.bookValue = '';
                    $scope.search.pbv = '';
                    $scope.search.eps = '';
                } else if (key === 'bv') {
                    $scope.search.symbol = '';
                    $scope.search.pbv = '';
                    $scope.search.eps = '';
                } else if (key === 'pbv') {
                    $scope.search.symbol = '';
                    $scope.search.bookValue = '';
                    $scope.search.eps = '';
                } else if (key === 'eps') {
                    $scope.search.symbol = '';
                    $scope.search.bookValue = '';
                    $scope.search.pbv = '';
                }
                gkey = key;
                gvalue = value;
                if (value === '') {
                    initStock();
                } else {
                    $http.get('/api/astsecs/'
                            + key + "/"
                            + value.toUpperCase() + '/'
                            + $scope.sortType + '/'
                            + $scope.sortReverse + '?token=' + $localStorage.token).success(function (securitys) {
                        $scope.securitys = securitys;
                    });
                }
            };


            $scope.sortTypeSelected = function (columnName) {
                $scope.sortType = columnName;
                console.log("before:" + $scope.sortReverse);
                $scope.sortReverse = !$scope.sortReverse;

                console.log("after:" + $scope.sortReverse);
                console.log('Page changed to: ' + $scope.currentPage);


                console.log($scope.sortType);
                $http.get('/api/astsecs/'
                        + gkey + '/'
                        + gvalue + '/'
                        + $scope.sortType + '/'
                        + $scope.sortReverse + '?token=' + $localStorage.token).success(function (securitys) {
                    $scope.securitys = securitys;
                    $scope.totalItems = securitys.length;
                });
            };

        });

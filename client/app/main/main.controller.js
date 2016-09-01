
/* global angular, value */

'use strict';

angular.module('stockApp').controller('MainCtrl', function ($scope, $http, $uibModal, $localStorage, $state) {
    $scope.rowCount = 0;
    $scope.detailStock = true;
    $scope.securitys = [];

    $scope.searchResult = function (value) {
        // console.log(value.toUpperCase());
        // var symbol = value.toUpperCase();

        $http.get('/api/astsecs/' + value.toUpperCase() + '?token='+$localStorage.token).success(function (securitys) {
            $scope.securitys = securitys;
            $scope.rowCount = securitys.length;
            console.log(securitys);
            if (securitys.length === 1) {
                $scope.tradeDate = securitys[0].trade_date;
                console.log(securitys[0].trade_date);
                $scope.pbv = securitys[0].pbv_rindex;
                $scope.book_value = securitys[0].book_value;
                $scope.priceBV = securitys[0].book_value * securitys[0].pbv_rindex;
                $scope.detailStock = false;
            } else {
                $scope.detailStock = true;
            }
        });

    };


    $scope.selectedIndustry = function () {
        console.log("start function selectedIndustry!");

        var securitySelected = this.security;
        // console.log($scope.securitySelected);

        var modalInstance = $uibModal.open({
            templateUrl: 'app/main/view-security-by-industry.html',
            controller: 'MainViewSecurityCtrl',
            size: 'lg',
            resolve: {
                securitySelected: function () {
                    return securitySelected;
                }
            }
        });

        // modalInstance.result.then(function (item) {
        //     $scope.security = item;
        // }, function () {
        //     //$log.info('Modal dismissed at: ' + new Date());
        // });            	
    };

})
        .controller('MainViewSecurityCtrl', function ($http, $scope, $uibModalInstance, securitySelected, $localStorage) {
            // console.log(securitySelected)
            $scope.rowCount = 0;
            $scope.detailStock = true;
            $scope.securitys = [];
            $scope.currentPage = 1;

            $scope.sortType = 'security_symbol'; // set the default sort type
            $scope.sortReverse = false;  // set the default sort order


            $scope.security = securitySelected;
            $http.get('/api/astsecs/' + securitySelected.industry_number
                    + '/' + securitySelected.sector_number
                    + '/' + $scope.currentPage
                    + '/' + $scope.sortType
                    + '/' + $scope.sortReverse + '?token='+$localStorage.token).success(function (securitys) {
                $scope.securitys = securitys.rows;
                $scope.totalItems = securitys.totalRows;
            });
            console.log('Page changed to: ' + $scope.currentPage);
            console.log($scope.sortReverse);
            console.log($scope.sortType);

            // console.log($scope.security)
            $scope.selected = function () {
                console.log(this.security);
                $uibModalInstance.close(this.security);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('Close');
            };
            // init paging



            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;

            };

            $scope.pageChanged = function () {
                console.log('Page changed to: ' + $scope.currentPage);
                console.log($scope.sortReverse);
                console.log($scope.sortType);
                $http.get('/api/astsecs/' + securitySelected.industry_number
                        + '/' + securitySelected.sector_number
                        + '/' + $scope.currentPage
                        + '/' + $scope.sortType
                        + '/' + $scope.sortReverse + '?token='+$localStorage.token).success(function (securitys) {
                    $scope.securitys = securitys.rows;
                    $scope.totalItems = securitys.totalRows;
                });

            };

            $scope.sortTypeSelected = function (columnName) {
                $scope.sortType = columnName;
                console.log("before:" + $scope.sortReverse);
                $scope.sortReverse = !$scope.sortReverse;

                console.log("after:" + $scope.sortReverse);
                console.log('Page changed to: ' + $scope.currentPage);

                console.log($scope.sortType);
                $http.get('/api/astsecs/' + securitySelected.industry_number
                        + '/' + securitySelected.sector_number
                        + '/' + $scope.currentPage
                        + '/' + $scope.sortType
                        + '/' + $scope.sortReverse + '?token=' +  $localStorage.token).success(function (securitys) {
                    $scope.securitys = securitys.rows;
                    $scope.totalItems = securitys.totalRows;
                });
            };
        });


/* global angular */

'use strict';

angular.module('stockApp').controller('NavbarCtrl', function($scope, $location, $localStorage, $state, $http) {

    // console.log($localStorage.user);
    $scope.user = $localStorage.user;
    $scope.isCollapsed = true;
    $scope.login = $scope.user.login;

    if ($scope.user.type_id === 1) {
        $scope.admin = true;
        $http.get('/api/menus' + '?token=' + $localStorage.token).success(function(response) {
            // console.log(response);
            $scope.menu = response.data;
        });
    } else {
        $http.get('/api/usermenus/' + $scope.user.id + '?token=' + $localStorage.token).success(function(response) {
            // console.log(response);
            $scope.menu = response.data;
        });
    }



    $scope.signOut = function() {
        // console.log("logout");
        delete $localStorage.token;
        delete $localStorage.user;
        $state.go('login');
    };

    $scope.isActive = function(route) {
        return route === $location.path();
    };
});

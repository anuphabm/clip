/* global angular */

'use strict';

angular.module('stockApp').controller('LoginCtrl', function($scope, $http, $localStorage, $state, $log) {
    console.log($localStorage.token);

    console.log($state);
    if ($localStorage.token !== undefined) {
        $http.get('/api/auths/' + $localStorage.token).success(function(response) {
            if (response.success) {
                $localStorage.token = response.token;
                $state.go($localStorage.user.main_page);
            } else {
                delete $localStorage.token;
                delete $localStorage.user;
            }
        });
    }

    $scope.auth = function() {
        $scope.alerts = [];
        console.log("start auts!");
        $http.post('/api/auths', $scope.users).success(function(response) {
            console.log(response);
            if (response.success) {
                $localStorage.token = response.token;
                $localStorage.user = response.data;
                $state.go($localStorage.user.main_page);
            } else {
                $scope.alerts.push({
                    msg: response.message,
                    type: 'success'
                });
            }

        });
    };


    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});

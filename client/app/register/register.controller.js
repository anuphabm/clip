/* global angular */

'use strict';

angular.module('stockApp').controller('RegisterCtrl', function ($scope, $http, $state, $localStorage) {
    $scope.alerts = [];
    $scope.regis = function () {
        console.log('start register pass[' + $scope.users.pass + ']passconfirm[' + $scope.confirmpass + ']');
        if ($scope.users.pass === $scope.confirmpass) {
            $http.post('/api/registers', $scope.users).success(function (response) {
                console.log(response);
                if (response.success) {
                    console.log(response.token);
                    $localStorage.token = response.token;
                    $http.get('/api/users/' + response.id + '?token=' + $localStorage.token).success(function (users) {
                        console.log(users);
                        $localStorage.user = users.data[0];
                        console.log($localStorage.user.id);
                    });

                    $state.go('login');
                } else {
                    $scope.alerts.push({msg: response.data});
                }
            });

        } else {
            $scope.alerts.push({msg: 'รหัสผู้ใช้ไม่ตรงกับรหัสผู้ใช้อีกครั้ง'});
        }

    };
});

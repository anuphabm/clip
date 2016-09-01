/* global angular */

'use strict';

angular.module('stockApp').controller('ProfileCtrl', function($scope, $localStorage, $http, Upload, $state) {
    //    console.log($localStorage.token);
    $scope.token = $localStorage.token;
    console.log($localStorage.userid);

    $http.get('/api/users/' + $localStorage.userid + '?token=' + $localStorage.token).success(function(response) {
        console.log(response.data[0]);
        $scope.user = response.data[0];
        console.log($scope.user);
    });


    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.save = function() {
        $scope.alerts = [];
        $http.put('/api/users?token=' + $localStorage.token, $scope.user).success(function(response) {
            $scope.alerts.push({
                msg: 'แกไขข้อมูลส่วนตัว สำเร็จ!'
            });
        });
    };

    $scope.uploadPic = function() {
        var oldfile = "";
        if ($scope.form.file.$valid && $scope.file) {
            console.log($scope.file);
            upload($scope.file);

        }
        if ($scope.user.image) {
            oldfile = $scope.user.image;
        }
        // upload on file select or drop
        function upload(file) {
            Upload.upload({
                url: 'api/uploads?token=' + $localStorage.token,
                data: {
                    file: file,
                    oldfile: oldfile
                }
            }).then(function(resp) {
                console.log(resp.data);
                if (resp.data.success) {
                    var name = resp.data.name;
                    var type = resp.data.type;
                    $http.put('/api/users/' + $scope.user.id + '?token=' + $localStorage.token, {
                        image: name,
                        type: type
                    }).success(function(response) {
                        //                        console.log(response);
                        $state.reload();
                    });
                }
            }, function(resp) {
                console.log('Error status: ' + resp.status);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }

    };
});

'use strict';

angular.module('stockApp').controller('LandingCtrl', function($scope, $http, $log, $localStorage, $uibModal) {

    $http.get('/api/todays').success(function(response) {
        $scope.rows = response.data;
        // console.log(response);
        if($scope.rows.length === 0){
            $http.get('/api/randoms').success(function(response) {
                $scope.rows = response.data;
            }
        });
    });


    $scope.sethref = function() {
        var filecontent = this.row;
        $scope.urldl='http://clip.zoomupmobile.com:8080/zclip/dl?id=' + filecontent.id;
    }

    $scope.download = function() {
        var filecontent = this.row;
        console.log('download video!');
        var urldl = '/api/videos/' + filecontent.id + '/dl';
        // $http.get('/api/videos/' + filecontent.id + '/dl').success(function(response) {
        //     console.log(response);
        // });
        var myObject;
        $http.get(urldl, myObject, {
                responseType: 'arraybuffer'
            })
            .success(function(data) {
                // console.log(data);
                var file = new Blob([data], {
                    type: 'application/3gpp'
                });
                console.log(file);
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(file, 'fileName.3gpp');
                };
            });

    };

    $scope.play = function() {
        var filecontent = this.row;
        console.log('open video!');
        var modalInstance = $uibModal.open({
            templateUrl: 'app/landing/_play.html',
            controller: 'PlayVideoCtrl',
            size: 'lg',
            resolve: {
                item: function() {
                    return filecontent;
                }
            }

        });
        modalInstance.result.then(function(response) {
            console.log('return close model:' + response);
            initNewpaper();
        }, function() {
            console.log('Modal dismissed at: ' + new Date());
        });

    };

}).controller('PlayVideoCtrl', function($http, $scope, $uibModalInstance, item, $localStorage) {


    $scope.filecontent = item;
    $scope.urlVideo = '/api/videos/' + item.id;

    console.log($scope.filecontent);

    $scope.vimeoURL = $scope.urlVideo;

    $http.post();



    $scope.cancel = function() {
        $uibModalInstance.dismiss('Close');
    };

});

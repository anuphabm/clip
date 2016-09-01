'use strict';

angular.module('stockApp').controller('ContentCtrl', function($scope, $http, $uibModal, $localStorage) {
    $scope.rowCount = 0;
    $scope.currentPage = 1;
    $scope.sortType = 'id'; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    var gkey = 'key';
    var gvalue = 'value';
    $scope.token = $localStorage.token;

    function initial() {
        console.log('start function initial()');
        $http.get('/api/contents/' + $localStorage.user.id + '/' + gkey + '/' + gvalue + '/' + $scope.currentPage + '/' + $scope.sortType + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function(response) {

            $scope.rows = response.data;
            console.log($scope.rows);
            $scope.totalItems = response.totalRows;
        });
    }

    initial();

    $scope.edit = function() {
        console.log(this.row);
        var item = this.row;

        var modalInstance = $uibModal.open({
            templateUrl: 'app/content/_form.html',
            controller: 'ContentsFormCtrl',
            size: 'lg',
            resolve: {
                item: function() {
                    return item;
                }
            }
        });
        modalInstance.result.then(function(response) {
            console.log('return close model:' + response);
            initial();
        }, function() {
            console.log('Modal dismissed at: ' + new Date());
        });


    };

    $scope.create = function() {
        var item = null;
        console.log('open from add!');
        var modalInstance = $uibModal.open({
            templateUrl: 'app/content/_form.html',
            controller: 'ContentsFormCtrl',
            size: 'lg',
            resolve: {
                item: function() {
                    return item;
                }
            }

        });

        modalInstance.result.then(function(response) {
            console.log('return close model:' + response);
            initial();
        }, function() {
            console.log('Modal dismissed at: ' + new Date());
        });
    };


    $scope.delete = function() {
        //        console.log($scope.rows);
        angular.forEach($scope.rows, function(row) {
            if (row.selected === true) {
                console.log(row);
                $http.get('/api/destroys/' + row.id + '?token=' + $localStorage.token).success(function(response) {
                    console.log(response);
                    $http.delete('/api/contents/' + row.id + '?token=' + $localStorage.token).success(function(response) {
                        console.log(response);
                        initial();
                    });

                });

            }
        });

    };

    $scope.checkAll = function() {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        angular.forEach($scope.rows, function(row) {
            row.selected = $scope.selectedAll;
        });

    };


    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;

    };

    $scope.pageChanged = function() {
        console.log('Page changed to: ' + $scope.currentPage);
        console.log($scope.sortReverse);
        console.log($scope.sortType);
        $http.get('/api/contents/' + $localStorage.user.id + '/' + gkey + '/' + gvalue + '/' + $scope.currentPage + '/' + $scope.sortType + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function(response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });

    };

    $scope.sortTypeSelected = function(columnName) {
        $scope.sortType = columnName;
        console.log("before:" + $scope.sortReverse);
        $scope.sortReverse = !$scope.sortReverse;

        console.log("after:" + $scope.sortReverse);
        console.log('Page changed to: ' + $scope.currentPage);

        console.log($scope.sortType);
        $http.get('/api/contents/' + $localStorage.user.id + '/' + gkey + '/' + gvalue + '/' + $scope.currentPage + '/' + $scope.sortType + '/' + $scope.sortReverse + '?token=' + $localStorage.token).success(function(response) {
            $scope.rows = response.data;
            $scope.totalItems = response.totalRows;
        });
    };

}).controller('ContentsFormCtrl', function($http, $scope, $uibModalInstance, item, $localStorage, Upload, $filter) {

    $scope.progressPercentage = 0;
    $scope.progressPercentageImage = 0;

    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();


    // Disable weekend selection
    // $scope.disabled = function(date, mode) {
    //     return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    // };

    $scope.open1 = function() {
        $scope.dtopened = true;
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);


    $scope.imageAlerts = [];
    $scope.videoAlerts = [];
    $scope.uploadFile = function(type) {
        console.log('action[' + type + ']');

        if (type === 'image') {
            if ($scope.form.preview.$valid && $scope.fileContent.preview) {
                console.log($scope.fileContent.preview);
                upload($scope.fileContent.preview);
            }

        } else {
            if ($scope.form.filename.$valid && $scope.fileContent.filename) {
                console.log($scope.fileContent.filename);
                upload($scope.fileContent.filename);

            }

        }
        // upload on file select or drop
        function upload(file) {
            Upload.upload({
                url: 'api/uploads?token=' + $localStorage.token,
                data: {
                    file: file
                }
            }).then(function(resp) {
                console.log(resp.data);
                console.log(resp.data.type);
                if (resp.data.type.indexOf('image') >= 0) {
                    console.log(resp.data.name);
                    console.log(resp.data.type);
                    $scope.fileContent.preview = resp.data.name;
                    $scope.fileContent.type_preview = resp.data.type;
                    $scope.fileContent.size_preview = resp.data.size;
                    $scope.flagImage = true;
                    $scope.imageAlerts.push({
                        msg: 'อัพโหลดรูปภาพสำเร็จ!',
                        type: 'success'
                    });
                } else {
                    $scope.fileContent.filename = resp.data.name;
                    $scope.fileContent.type_filename = resp.data.type;
                    $scope.fileContent.size_filename = resp.data.size;
                    $scope.flagVideo = true;
                    $scope.videoAlerts.push({
                        msg: 'อัพโหลดวิดิโอสำเร็จ!',
                        type: 'success'
                    });
                }


                // response.push(resp.data);
                //                     var name = resp.data.name;
                //                     var type = resp.data.type;
                //                     $http.put('/api/users/' + $scope.user.id + '?token=' + $localStorage.token, {image: name, type: type}).success(function (response) {
                // //                        console.log(response);
                //                         $state.reload();
                //                     });
            }, function(resp) {
                console.log('Error status: ' + resp.status);
            }, function(evt) {

                if (evt.config.data.file.type.indexOf('video') > -1) {
                    $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + $scope.progressPercentage + '% ' + evt.config.data.file.name);

                } else {
                    $scope.progressPercentageImage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + $scope.progressPercentageImage + '% ' + evt.config.data.file.name);

                }

            });
        }

    };


    var command = 'save';
    if (item !== null) {
        $scope.fileContent = item;
        $scope.dt = item.ondate;
        $scope.flagImage = true;
        $scope.flagVideo = true;
        $scope.imageAlerts.push({
            msg: '',
            type: 'success'
        });
        $scope.videoAlerts.push({
            msg: '',
            type: 'success'
        });

        command = 'edit';
    }


    $scope.save = function() {

        console.log($scope.fileContent);
        console.log(command);

        if (command === 'save') {
            $scope.fileContent.user_id = $localStorage.user.id;
            $scope.fileContent.ondate = $filter('date')($scope.dt, 'yyyy-MM-dd');

            $http.post('/api/contents?token=' + $localStorage.token, $scope.fileContent).success(function(response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        } else {
            console.log($scope.fileContent);
            $scope.fileContent.update_date = new Date();
            $scope.fileContent.ondate = $filter('date')($scope.dt, 'yyyy-MM-dd');
            console.log($scope.dt);
            // console.log($scope.dt.toISOString());
            console.log($scope.fileContent.ondate);
            $http.patch('/api/contents?token=' + $localStorage.token, $scope.fileContent).success(function(response) {
                console.log('response from post:' + response);
                $uibModalInstance.close(response);
            });
        }

    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss('Close');
    };

});

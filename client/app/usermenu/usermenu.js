'use strict';

angular.module('stockApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('usermenu', {
        url: '/usermenu',
        templateUrl: 'app/usermenu/usermenu.html',
        controller: 'UsermenuCtrl'
      });
  });

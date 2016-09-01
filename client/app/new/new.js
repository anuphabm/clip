/* global angular */

'use strict';

angular.module('stockApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('new', {
        url: '/new',
        templateUrl: 'app/new/new.html',
        controller: 'NewCtrl'
      });
  });
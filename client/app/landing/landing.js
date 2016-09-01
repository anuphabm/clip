'use strict';

angular.module('stockApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'app/landing/landing.html',
        controller: 'LandingCtrl'
      });
  });

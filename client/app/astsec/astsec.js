/* global angular */

'use strict';

angular.module('stockApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('astsec', {
        url: '/astsec',
        templateUrl: 'app/astsec/astsec.html',
        controller: 'AstsecCtrl'
      });
  });
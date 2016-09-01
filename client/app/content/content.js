'use strict';

angular.module('stockApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('content', {
        url: '/content',
        templateUrl: 'app/content/content.html',
        controller: 'ContentCtrl'
      });
  });

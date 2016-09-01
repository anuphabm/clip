/* global angular */

'use strict';

angular.module('stockApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ngStorage',
    'ngFileUpload',
    'ui.select',
    'ngSanitize',
    'checklist-model',
    'uiSwitch'
]).config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    // console.log($urlRouterProvider);
});

'use strict';

describe('Controller: MenuCtrl', function () {

  // load the controller's module
  beforeEach(module('stockApp'));

  var MenuCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MenuCtrl = $controller('MenuCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
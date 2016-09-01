'use strict';

describe('Controller: UsermenuCtrl', function () {

  // load the controller's module
  beforeEach(module('stockApp'));

  var UsermenuCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsermenuCtrl = $controller('UsermenuCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});

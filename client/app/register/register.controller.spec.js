'use strict';

describe('Controller: RegisterCtrl', function () {

  // load the controller's module
  beforeEach(module('stockApp'));

  var RegisterCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RegisterCtrl = $controller('RegisterCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
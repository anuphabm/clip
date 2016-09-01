'use strict';

describe('Controller: AstsecCtrl', function () {

  // load the controller's module
  beforeEach(module('stockApp'));

  var AstsecCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AstsecCtrl = $controller('AstsecCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});

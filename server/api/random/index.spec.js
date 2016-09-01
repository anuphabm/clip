'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var randomCtrlStub = {
  index: 'randomCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var randomIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './random.controller': randomCtrlStub
});

describe('Random API Router:', function() {

  it('should return an express router instance', function() {
    randomIndex.should.equal(routerStub);
  });

  describe('GET /api/randoms', function() {

    it('should route to random.controller.index', function() {
      routerStub.get
        .withArgs('/', 'randomCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});

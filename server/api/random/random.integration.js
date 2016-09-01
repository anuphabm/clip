'use strict';

var app = require('../..');
import request from 'supertest';

describe('Random API:', function() {

  describe('GET /api/randoms', function() {
    var randoms;

    beforeEach(function(done) {
      request(app)
        .get('/api/randoms')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          randoms = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      randoms.should.be.instanceOf(Array);
    });

  });

});

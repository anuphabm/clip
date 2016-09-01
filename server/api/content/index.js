'use strict';

var express = require('express');
var controller = require('./content.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:userid/:key/:value/:page/:sortName/:sortType', controller.show);
router.post('/', controller.create);
router.patch('/', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;

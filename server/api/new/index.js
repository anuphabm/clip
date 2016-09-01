/* global module */

'use strict';

var express = require('express');
var controller = require('./new.controller');

var router = express.Router();

router.get('/:key/:value/:page/:sortName/:sortType', controller.index);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/:id', controller.delete);
module.exports = router;
/* global module */

'use strict';

var express = require('express');
var controller = require('./menu.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;

/* global module */

'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:key/:value/:page/:sortName/:sortType', controller.listlimit);
router.get('/:id', controller.show);
router.put('/:id', controller.updatePic);
router.put('/', controller.update);
router.delete('/:id', controller.delete);
router.post('/', controller.create);

module.exports = router;

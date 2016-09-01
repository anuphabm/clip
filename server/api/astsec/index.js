/* global module */

'use strict';

var express = require('express');
var controller = require('./astsec.controller');

var router = express.Router();

router.get('/:sortName/:sortType', controller.index);
router.get('/:token', controller.index);
router.get('/:key/:value/:sortName/:sortType', controller.index);
router.get('/:industry/:sector/:page/:sortName/:sortType', controller.byindustry);
module.exports = router;
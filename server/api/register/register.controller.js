/* global exports, __dirname */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/registers              ->  index
 */

'use strict';
var _ = require('lodash');
var path = require('path');
var pg = require('pg');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('register');
logger.info("start controller!");

var async = {};
async.forEach = function(o, cb) {
    var counter = 0,
        keys = Object.keys(o),
        len = keys.length;
    var next = function() {
        if (counter < len) cb(o[keys[counter++]], next);
    };
    next();
};



//insert into table register
exports.create = function(req, res) {
    var data = req.body;
    logger.info(data);
    var results = [];
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            logger.info(err);
            return res.status(500).json({
                success: false,
                data: err
            });
        }

        var token = jwt.sign(data.login, config.secret, {
            expiresIn: 1440 // expires in 24 hours
        });

        // SQL Query > Select Data

        data.token = token;

        var i = 0;
        var field = '';
        var value = '';
        var key = Object.keys(data);
        async.forEach(data, function(val, next) {
            // do things
            field += key[i++] + ',';
            value += "'" + val + "',";
            next();
        });
        var sql = 'insert into users (' + field + ') values(' + value + ') returning id';
        sql = sql.replace(/,\)/g, ')');
        
        var query = client.query(sql);

        query.on('row', function(row) {
            //            logger.info(row);
            results.push(row);
        });
        query.on('end', function(row) {
            //            logger.info(row);
            done();
            logger.info(results);
            return res.json({
                success: true,
                id: results[0].id,
                token: token
            });
        });
    });
};

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/randoms              ->  index
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
var logger = log4js.getLogger('randoms');


exports.index = function(req, res) {

    var results = [];

    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({
                success: false,
                data: err
            });
        }

        // SQL Query > Select Data
        var sql = "select * from content.file_content order by random() limit 2 ";
        sql += " order by subject ";

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json({
                success: true,
                data: results
            });
        });

    });
};

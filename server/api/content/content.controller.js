/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/contents              ->  index
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
var logger = log4js.getLogger('content');

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

logger.info("start controller!");

exports.show = function(req, res) {
    var results = [];
    var user_id = req.params.userid;

    var pageNumber = req.params.page - 1;
    var sortName = req.params.sortName;
    var sortType = req.params.sortType;
    var orderBy = "asc";
    if (sortType === 'true') {
        orderBy = "desc";
    }
    var totalRows = 0;
    var offset = 0;
    var maxSize = 10;

    if (pageNumber > 0) {
        offset = (pageNumber * maxSize);
    }
    logger.info("offset[" + offset + "]");



    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }
        var sqlCount = "select count(*) as countRow from content.file_content where user_id= "+ user_id;   

        client.query(sqlCount, function (err, result) {
            logger.info(sqlCount);
            if (err) {
                return console.error('error running query', err);
            }
            totalRows = result.rows[0].countrow;
            logger.info(result.rows[0].countrow);            
        });

        // SQL Query > Select Data
        var sql = "select * from content.file_content where user_id= "+ user_id;        
        sql += " order by " + sortName + " " + orderBy + " offset " + offset + " limit " + maxSize;

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json({
                success: true,
                data: results,
                totalRows: totalRows

            });
        });

    });    
};

// Gets a list of Contents
exports.index = function(req, res) {

    var results = [];

    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        var sql = "select * from content.file_content where ondate=current_date ";
        sql += " order by subject ";

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json({
                success: true,
                data: results
            });
        });

    });
};


// Create news data
exports.create = function(req, res) {
    logger.info(req.body);
    var data = req.body;
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
        var sql = 'insert into content.file_content (' + field + ') values(' + value + ') returning id';
        sql = sql.replace(/,\)/g, ')');
        logger.info(sql);

        var query = client.query(sql);

        query.on('row', function (row) {
            results.push(row);
        });

        query.on('end', function (row) {
            done();
            logger.info(results);
            return res.json({
                success: true,
                id: results[0].id
            });
        });                
    });
};



// Update news data
exports.update = function(req, res) {
    logger.info(req.body);
    var data = req.body;
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

        var update = '';
        var i = 0;
        var key = Object.keys(data);
        async.forEach(data, function(val, next) {
            // do things
            update += key[i++] + '=' + "'" + val + "',";
            next();
        });
        var sql = "update content.file_content set " + update + " where id=" + data.id;
        sql = sql.replace(/, where/g, ' where');

        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: data
            });
        });
    });
};



exports.destroy = function(req, res) {
    logger.info('start api delete!');

    var id = req.params.id;
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

        // SQL Query > Select Data
        var sql = "delete from content.file_content where id=" + id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: id
            });
        });
    });
};

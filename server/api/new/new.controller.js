/* global exports, __dirname, angular, array */

'use strict';

var _ = require('lodash');

var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('newpaper');
logger.info("start controller!");

// Delete new

exports.delete = function (req, res) {
    logger.info('start api delete!');
    logger.info(req);
    var id = req.params.id;
    var results = [];

    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            logger.info(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        var sql = "delete from stock.new where id=" + id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function () {
            done();
            logger.info("size of:" + results.length);
            return res.json({                
                "delete-id": id
            });
        });

    });

};

// Update news data
exports.update = function (req, res) {
    logger.info(req.body);
    var newpaper = req.body;
    var results = [];
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        var sql = "update stock.new set subject='" + newpaper.subject + "', detail='" + newpaper.detail + "', stamptime=now() where id=" + newpaper.id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function () {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                "rows": 1
            });
        });

    });

};

// Create news data
exports.create = function (req, res) {
    logger.info(req.body);
    var newpaper = req.body;
    var results = [];
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            logger.info(err);
            return res.status(500).json({success: false, data: err});
        }
        
        if(newpaper === null){
            return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        var sql = "insert into stock.new (subject, detail)values('" + newpaper.subject + "','" + newpaper.detail + "') ";
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function () {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                message: "insert new paper success"
            });
        });

    });
};

// Get list of news
exports.index = function (req, res) {

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
    var results = [];
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

        var sqlCount = "select count(*) as countRow from stock.new ";

        client.query(sqlCount, function (err, result) {
            logger.info(sqlCount);
            if (err) {
                return console.error('error running query', err);
            }
            totalRows = result.rows[0].countrow;
            logger.info(result.rows[0].countrow);
            client.end();
        });

        // SQL Query > Select Data
        var sql = "select * from stock.new ";
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
                "totalRows": totalRows,
                "rows": results
            });
        });

    });
};
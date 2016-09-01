/* global exports, __dirname */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/usermenus              ->  index
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
var logger = log4js.getLogger('usermenu');
logger.info("start controller!");

exports.delete = function(req, res) {
    logger.info('start api delete!');
    // logger.info(req);
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
        var sql = "delete from stock.user_menu where id=" + id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                id: id,
                message: 'delete success'
            });
        });

    });

};

// Update news data
exports.update = function(req, res) {
    // logger.info(req.body);
    var usermenu = req.body;
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
        var sql = "update stock.user_menu set menu_id=" + usermenu.menu_id + ", user_id=" + usermenu.user_id + ", status='" + usermenu.status + "', updatetime=now() where id=" + usermenu.id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: usermenu,
                message: 'update success'
            });
        });

    });

};

// Create news data
exports.create = function(req, res) {
    logger.info('create function');
    // logger.info(req);
    var usermenu = req.body;
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

        if (usermenu === null) {
            return res.status(500).json({
                success: false,
                data: err
            });
        }
        // SQL Query > Select Data
        var sql = "insert into stock.user_menu (menu_id, user_id)values('" + usermenu.menu_id + "','" + usermenu.user_id + "') ";
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: usermenu,
                message: "insert menu success"
            });
        });

    });
};

exports.show = function(req, res) {
    var userid = req.params.id;
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
        var sql = "select um.menu_id, um.user_id, login, title, link, icon, um.status " + "from stock.user_menu um inner join stock.menu m on um.menu_id=m.id " + "inner join users u on um.user_id=u.id " + "where m.status='Y' and user_id=" + userid + " order by menu_id";

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

// Get list of news
exports.index = function(req, res) {

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

        var sqlCount = "select count(*) as countRow " + "from stock.user_menu um inner join stock.menu m on um.menu_id=m.id " + "inner join users u on um.user_id=u.id " + "where m.status='Y'";

        client.query(sqlCount, function(err, result) {
            logger.info(sqlCount);
            if (err) {
                return console.error('error running query', err);
            }
            totalRows = result.rows[0].countrow;
            logger.info(result.rows[0].countrow);
            // client.end();
        });

        // SQL Query > Select Data
        var sql = "select um.id, um.menu_id, um.user_id,  login, title, link, icon, um.status " + "from stock.user_menu um inner join stock.menu m on um.menu_id=m.id " + "inner join users u on um.user_id=u.id " + "where m.status='Y' " + " order by " + sortName + " " + orderBy + " offset " + offset + " limit " + maxSize;
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
                data: results,
                totalRows: totalRows,
            });
        });

    });
};

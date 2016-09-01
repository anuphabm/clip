/* global __dirname, exports */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/menus              ->  index
 */

'use strict';
var _ = require('lodash');
var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('menu');
logger.info("start controller!");

exports.show = function(req, res) {
    var results = [];
    var userid = req.params.id;
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
        var sql = "select m.* from stock.menu m left join (select um.* from users u left join stock.user_menu um on u.id = um.user_id where type_id != 1 and um.status = 'Y'  and u.id = " + userid + ") t1 on m.id = t1.menu_id where t1.id is null and m.status = 'Y'";

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

// Gets a list of Menus
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
        var sql = "delete from stock.menu where id=" + id;
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
    logger.info(req.body);
    var menu = req.body;
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
        var sql = "update stock.menu set title='" + menu.title + "', link='" + menu.link + "', icon='" + menu.icon + "', status='" + menu.status + "', stamptime=now() where id=" + menu.id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: menu,
                message: 'update success'
            });
        });

    });

};

// Create news data
exports.create = function(req, res) {
    logger.info(req.body);
    var menu = req.body;
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

        if (menu === null) {
            return res.status(500).json({
                success: false,
                data: err
            });
        }
        // SQL Query > Select Data
        var sql = "insert into stock.menu (title, link, icon)values('" + menu.title + "','" + menu.link + "','" + menu.icon + "') ";
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                success: true,
                data: menu,
                message: "insert menu success"
            });
        });

    });
};

// Get list of news
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
        var sql = "select * from stock.menu where status='Y'";

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

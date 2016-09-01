/* global exports, __dirname */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/users              ->  index
 */

'use strict';
var _ = require('lodash');
var path = require('path');
var fs = require('fs-extra'); //File System-needed for renaming file etc
var pg = require('pg');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('user');
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

        if (data === null) {
            return res.status(500).json({
                success: false,
                data: err
            });
        }
        var token = jwt.sign(data.login, config.secret, {
            expiresIn: 1440 // expires in 24 hours
        });

        // SQL Query > Select Data
        // var sql = "insert into datas (login, pass, token)values('" + user.login + "','" + user.pass + "','" + token + "') returning id ";
        // logger.info(sql);
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
        logger.info(sql);

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

// Get list of news
exports.delete = function(req, res) {
    logger.info('start api delete!');
    //    logger.info(req);
    var id = req.params.id;
    var results = [];
    var image = "";
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            //            logger.info(err);
            return res.status(500).json({
                success: false,
                data: err
            });
        }
        // SQL Query > Select Data
        var sqlselect = "select * from users where id=" + id;
        logger.info(sqlselect);
        client.query(sqlselect, function(err, result) {
            //            logger.info(result);
            if (err) {
                return logger.error('error running query', err);
            }

            image = result.rows[0].image;
        });


        var sql = "delete from users where id=" + id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            logger.info("size of:" + results.length + " image:" + image);
            if (!_.isEmpty(image)) {
                var basepath = path.join(__dirname, '../', '../');

                fs.remove(basepath + 'assets/images/' + image, function(err) {
                    if (err) {
                        logger.error(err);
                        return res.json({
                            success: false,
                            message: "Not delete oldfile"
                        });
                    }
                });
            }

            return res.json({
                success: true,
                "delete-id": id
            });
        });
    });
};

exports.listlimit = function(req, res) {

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

        var sqlCount = "select count(*) as countRow from users ";

        client.query(sqlCount, function(err, result) {
            logger.info(sqlCount);
            if (err) {
                return console.error('error running query', err);
            }
            totalRows = result.rows[0].countrow;
            logger.info(result.rows[0].countrow);
        });

        // SQL Query > Select Data
        var sql = "select * from users ";
        sql += " order by " + sortName + " " + orderBy + " offset " + offset + " limit " + maxSize;

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
                totalRows: totalRows,
                data: results
            });
        });

    });
};
// update image for user
exports.updatePic = function(req, res) {
    var id = req.params.id;
    var user = req.body;
    logger.info(user);
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
        var sql = "update users set image='" + user.image + "', content_type='" + user.type + "' where id=" + id;
        logger.info(sql);
        var query = client.query(sql);

        query.on('end', function() {
            done();
            return res.json({
                success: true,
                message: 'success'
            });
        });

    });
};
// Gets a list of Users insert into db
exports.update = function(req, res) {

    var data = req.body;
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
        var sql = "update users set " + update + " where id=" + data.id;
        sql = sql.replace(/, where/g, ' where');

        logger.info(sql);

        var query = client.query(sql);

        query.on('end', function() {
            done();
            return res.json({
                success: true,
                message: 'edit user success'
            });
        });

    });
};

exports.index = function(req, res) {
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        var results = [];
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({
                success: false,
                data: err
            });
        }

        // SQL Query > Select Data
        var sql = "select * from users order by login";

        //        sql += " order by " + sortName + " " + orderBy;
        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

};

exports.show = function(req, res) {
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        var results = [];
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({
                success: false,
                data: err
            });
        }

        // SQL Query > Select Data
        var sql = "select * from users where login='" + req.decoded + "'";

        //        sql += " order by " + sortName + " " + orderBy;
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

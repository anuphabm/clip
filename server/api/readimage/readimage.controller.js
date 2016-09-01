/* global exports, __dirname */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/readimages              ->  index
 */

'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;

var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('readimage');
//logger.info(path);    
logger.info("start controller!");

// Gets a list of Readimages
exports.index = function(req, res) {
    var user = [];
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
        var sql = "select * from users where login='" + req.decoded + "'";

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            user.push(row);
            //            logger.info(user);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            var basepath = path.join(__dirname, '../', '../');
            var pathImage = 'assets/images/';
            var fileimage = pathImage + user[0].image;
            var type = user[0].content_type;
            logger.info('user[' + user[0].login + ']' + user[0].image);
            logger.info(user[0].image === 'null');
            logger.info(_.isEmpty(user[0].image));

            if (user[0].image === 'null') {
                fileimage = pathImage + 'yeoman.png';
                type = "image/png";
            }
            logger.info('user[' + user[0].login + ']fileimage[' + fileimage + ']type[' + type + ']');
            fs.stat(path.join(basepath + fileimage), function(err, stat) {
                if(err){
                    return res.status(500).json({success: false, data: err});
                }
                var img = fs.readFileSync(path.join(basepath + fileimage));
                res.contentType = type;
                res.contentLength = stat.size;
                return res.end(img, 'binary');
            });
        });

    });
    //    return res.json({success: true, message: 'success', user: req.decoded});
};

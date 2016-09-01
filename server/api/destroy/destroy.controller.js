/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/destroys              ->  index
 */

'use strict';

var _ = require('lodash');
var fs = require('fs-extra'); //File System-needed for renaming file etc
var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;

var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('destroy');
//logger.info(path);    
logger.info("start controller!");

// Gets a list of Destroys
exports.index = function(req, res) {
    var results = [];
    var id = req.params.id;

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
        var sql = "select * from content.file_content where id=" + id;

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
        	logger.info(row);
            results.push(row);

        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
        	logger.info(results);
            done();
            var fullpath = '';
            var basepath = path.join(__dirname, '../', '../');
            var pathImage = 'assets/images/';
            var fileimage = pathImage + results[0].preview;
            var pathVideo = 'assets/video/';
            var fileVideo = pathVideo + results[0].filename;

            //        delete old file

            fs.remove(basepath + pathImage + fileimage, function(err) {
                if (err) {
                    logger.error(err);
                    return res.json({
                        success: false,
                        message: "Not delete oldfile"
                    });
                }
            });

            fs.remove(basepath + pathVideo + fileVideo, function(err) {
                if (err) {
                    logger.error(err);
                    return res.json({
                        success: false,
                        message: "Not delete oldfile"
                    });
                }
            });

            logger.info('delete file complete');
            return res.json({
                success: true,
                message: "Delete success"
            });


        });

    });
}

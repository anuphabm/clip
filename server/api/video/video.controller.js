/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/videos              ->  index
 */

'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;

var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('video');
//logger.info(path);
logger.info("start controller!");


exports.download = function(req, res) {

    var results = [];
    var id = req.params.id;
    var dl = req.params.dl;

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
        var sql = "select * from content.file_content where id='" + id + "'";

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
            //            logger.info(results);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            var basepath = path.join(__dirname, '../', '../');
            var pathVideo = 'assets/video/';
            var filevideo = pathVideo + results[0].filename;
            var mimetype = results[0].type_filename;
            var file = path.join(basepath + filevideo);
            var sizefile = results[0].size_filename;
            logger.info('mime[' + mimetype + ']file[' + file + ']size[' + sizefile + ']');
            // var filename = path.basename(file);
            // var mimetype = mime.lookup(file);

            // res.setHeader('Content-disposition', 'attachment; filename=' + file);
            // res.setHeader('Content-type', mimetype);
            // res.setHeader('Content-Length', sizefile);
            // var filestream = fs.createReadStream(file);
            // return filestream.pipe(res);

            // fs.stat(file, function(err, stat) {
            //     var data = fs.readFileSync(file);
            //     logger.info(stat);
            //     res.writeHead(200, {
            //         'Content-Type': 'application/octet-stream',
            //         'Content-disposition': 'attachment;filename=' + results[0].filename,
            //         'Content-Length': stat.size,
            //         'Buffer-size': 4024
            //     });
            //     return res.end(new Buffer(data, 'binary'));
            // });

            // var filePath = path.join(__dirname, 'myfile.mp3');
            var stat = fs.statSync(file);
            logger.info(stat);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-disposition': 'attachment;filename=' + results[0].filename,
                'Content-Length': stat.size
            });

            var readStream = fs.createReadStream(file);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
        });

    });

};

// Gets a list of Videos
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
        var sql = "select * from content.file_content where id='" + id + "'";

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
            //            logger.info(results);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            var basepath = path.join(__dirname, '../', '../');
            var pathVideo = 'assets/video/';
            var filevideo = pathVideo + results[0].filename;
            var type = results[0].type_filename;

            // if (results[0].filename === 'null') {
            //     filevideo = pathVideo + 'yeoman.png';
            //     type = "image/png";
            // }

            logger.info('results filevideo[' + filevideo + ']type[' + type + ']');
            logger.info(req.headers);
            var range = req.headers.range;
            logger.info(range);
            if (range === undefined) {
                return res.status(500).json({
                    success: false,
                    data: 'header range is null'
                });
            }
            var positions = range.replace(/bytes=/, "").split("-");
            logger.info(positions);
            var start = parseInt(positions[0], 10);
            logger.info('start:' + start);
            var file = path.join(basepath + filevideo);
            logger.info("file video[" + file + "]");

            fs.stat(file, function(err, stats) {
                var total = stats.size;
                logger.info('total:' + total);
                var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
                logger.info('end:' + end);
                var chunksize = (end - start) + 1;
                logger.info('size file:' + chunksize);
                // res.contentType = results[0].type_filename;
                // res.contentLength = chunksize
                res.writeHead(206, {
                    "Content-Range": "bytes " + start + "-" + end + "/" + total,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": results[0].type_filename
                });
                var stream = fs.createReadStream(file, {
                    start: start,
                    end: end
                }).on("open", function() {
                    stream.pipe(res);
                }).on("error", function(err) {
                    res.end(err);
                });
            });
        });

    });
}

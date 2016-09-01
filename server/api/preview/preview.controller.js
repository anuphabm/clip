/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/previews              ->  index
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
var logger = log4js.getLogger('preview');
//logger.info(path);    
logger.info("start controller!");

// Gets a list of Previews
exports.index = function (req, res) {
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
            if(results.length === 0){
                return res.json({success: false, message: 'Not value'});

            }
            var basepath = path.join(__dirname, '../', '../');
            var pathImage = 'assets/images/';
            var fileimage = pathImage + results[0].preview;
            var type = results[0].type_preview;
            logger.info(results[0].preview === 'null');
            logger.info(_.isEmpty(results[0].preview));

            if (results[0].preview === 'null') {
                fileimage = pathImage + 'yeoman.png';
                type = "image/png";
            }
            logger.info('results fileimage[' + fileimage + ']type[' + type + ']');
            fs.stat(path.join(basepath + fileimage), function(err, stat) {
                var img = fs.readFileSync(path.join(basepath + fileimage));
                res.contentType = type;
                res.contentLength = stat.size;
                return res.end(img, 'binary');
            });
        });

    });
}

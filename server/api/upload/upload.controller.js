/* global exports, __dirname */

/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/uploads              ->  index
 */

'use strict';
var _ = require('lodash');
//var multipart = require("multipart");
//var fs = require("fs");
var mv = require('mv');
var bodyParser = require('body-parser'); //connects bodyParsing middleware
var formidable = require('formidable');
var path = require('path'); //used for file path
var fs = require('fs-extra'); //File System-needed for renaming file etc
var dateFormat = require('dateformat')
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('upload');

logger.info("start controller!");


exports.index = function(req, res) {
    //    logger.info(req);
    var form = new formidable.IncomingForm();
    //    logger.info(form);
    //Formidable uploads to operating systems tmp dir by default
    //    form.uploadDir = "./assets/images";       //set upload directory
    form.keepExtensions = true; //keep file extension

    form.parse(req, function(err, fields, files) {
        //        logger.info(err);
        logger.info(fields);
        logger.info(files);
        if (err) {
            return res.status(500).json({
                success: false,
                data: err
            });
        }
        //Formidable changes the name of the uploaded file
        //Rename the file to its original name
        var basepath = path.join(__dirname, '../', '../');
        var pathUpload = 'assets/images/';
        logger.info(files.file.type);

        if (files.file.type.indexOf('video') >= 0) {
            pathUpload = 'assets/video/';
        }

        //        delete old file
        if (!_.isEmpty(fields.oldfile)) {
            fs.remove(basepath + pathUpload + fields.oldfile, function(err) {
                if (err) {
                    logger.error(err);
                    return res.json({
                        success: false,
                        message: "Not delete oldfile"
                    });
                }
            });
        }
        //                upload filepath: '/var/folders/j_/bnydbs4j68b0jd7n2cm0zh0c0000gn/T/upload_397b1edc446d3f78d38bd2564cd0c57d.jpg',
        var now = new Date();
        var timenow = dateFormat(now, "yyyymmddhhMMss");
        var newext = files.file.path.substr(files.file.path.indexOf('.'));
        var newfile = basepath + pathUpload + timenow + newext.toLowerCase();
        mv(files.file.path, newfile, function(err) {
            if (err) {
                logger.info(err);
                return res.json({
                    success: false,
                    mess: err
                });
            }
            logger.info('renamed complete');
            return res.json({
                success: true,
                message: "Upload success",
                name: timenow + newext.toLowerCase(),
                type: files.file.type,
                size: files.file.size
            });
        });


    });
};

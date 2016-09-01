/* global exports, __dirname */

'use strict';

var _ = require('lodash');
var path = require('path');
var pg = require('pg');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;

var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('auth');

logger.info("start controller!");


// Get list of auths

exports.index = function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
    // decode token
    logger.info(token);
    if (token) {
        // verifies secret and checks exp
        logger.info(config.secret);
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.' + err});
            } else {
                return res.json({success: true, message: 'Enjoy your token!', token: token});
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }

};

exports.auth = function (req, res) {
    var results = [];
//    logger.info(req);
    var user = req.body;

    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            logger.error(err);
            return res.status(500).json({success: false, data: err});
        }

        var sql = "select * from users where login='" + user.login + "' and pass='" + user.pass + "' ";

        logger.info(sql);
        client.query(sql, function (err, result) {
//            logger.info(result);
            if (err !== null) {
                logger.error(err);
                client.end();
//                logger.info('end program!');
                return res.status(500).json({success: false, data: err});
            }
            if (result.rowCount === 0) {
                client.end();
//                logger.info('end program!');
                return res.json({success: false, message: 'Authentication failed. User not found.'});
            } else {
                if (result.password !== req.body.password) {
                    client.end();
//                    logger.info('end program!');
                    return res.json({success: false, message: 'Authentication failed. Wrong password.'});
                }
                
                var token = jwt.sign(user.login, config.secret, {
                    expiresInMinutes: 120
                });
                // return the information including token as JSON
                client.end();
//                logger.info('end program!');
                return res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    data: result.rows[0],
                    token: token
                });
            }
        });
        
    });
};
/* global module, __dirname */

/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config');
var log4js = require('log4js');
var logger = log4js.getLogger('routes');

logger.info("start routes!");


module.exports = function (app) {

    // Insert routes below
    app.use('/api/randoms', require('./api/random'));
    app.use('/api/todays', require('./api/today'));
    app.use('/api/videos', require('./api/video'));
    app.use('/api/previews', require('./api/preview'));
    app.use('/api/registers', require('./api/register'));
    app.use('/api/auths', require('./api/auth'));
    app.use('/api/uploads', require('./api/upload'));

    app.use(function (req, res, next) {
        // check header or url parameters or post parameters for token
//        logger.info(req);
        var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;
        // decode token
        logger.info("token:" + token);
        if (token) {
            // verifies secret and checks exp
//            logger.info(config.secret);
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({success: false, message: 'Failed to authenticate token.' + err});
                } else {
                    // if everything is good, save to request for use in other routes
                    logger.info("decode:" + decoded);
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
//            app.use('/api/auths', require('./api/auth'));
        }
    });
    app.use('/api/news', require('./api/new'));
    app.use('/api/astsecbyindustrys', require('./api/astsecbyindustry'));
    app.use('/api/astsecs', require('./api/astsec'));
    app.use('/api/things', require('./api/thing'));
    app.use('/api/readimages', require('./api/readimage'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/menus', require('./api/menu'));
    app.use('/api/usermenus', require('./api/usermenu'));
    app.use('/api/contents', require('./api/content'));
    app.use('/api/destroys', require('./api/destroy'));
    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
            .get(errors[404]);

    // All other routes should redirect to the index.html
    app.route('/*')
            .get(function (req, res) {
                res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
            });
};

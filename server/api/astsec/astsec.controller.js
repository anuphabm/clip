/* global exports, __dirname */

'use strict';

var _ = require('lodash');
var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = config.database;
var log4js = require('log4js');
//log4js.configure(path.join(__dirname, '../', '../', 'config/log4js.json'));
var logger = log4js.getLogger('astsec');

logger.info("start controller!");


exports.byindustry = function (req, res) {
    var results = [];
    var industryNumber = req.params.industry;
    var sectorNumber = req.params.sector;
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

    logger.info("industry[" + industryNumber + "]sector[" + sectorNumber + "]page[" + pageNumber + "]sortName[" + sortName + "]orderby[" + orderBy + "]");
    if (pageNumber > 0) {
        offset = (pageNumber * maxSize);
    }
    logger.info("offset[" + offset + "]");
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        var sqlCount = "select count(*) as countRow from stock.astsec where trade_date=(select max(trade_date) from stock.rindex) ";
        sqlCount += " and isoddlot='N' and security_type='S' and industry_number=" + industryNumber + " and sector_number=" + sectorNumber;

        client.query(sqlCount, function (err, result) {
            logger.info(sqlCount);
            if (err) {
                return console.error('error running query', err);
            }
            totalRows = result.rows[0].countrow;
            logger.info(result.rows[0].countrow);
            client.end();
        });

        // SQL Query > Select Data
        var sql = "select * from stock.astsec where trade_date=(select max(trade_date) from stock.rindex) ";
        sql += " and isoddlot='N' and security_type='S' and industry_number=" + industryNumber + " and sector_number=" + sectorNumber;
        if (sortName !== 'security_symbol' && sortName !== 'last_traded_price' && sortName !== 'pe_ratio') {
            sql += " order by to_number(" + sortName + ",'999D99999') " + orderBy + " offset " + offset + " limit " + maxSize;
        } else {
            sql += " order by " + sortName + " " + orderBy + " offset " + offset + " limit " + maxSize;
        }

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            logger.info("size of:" + results.length);
            return res.json({
                "totalRows": totalRows,
                "rows": results
            });
        });

    });

};

// Get Single astsecs by security_symbol
exports.show = function (req, res) {
    var results = [];
    var value = req.params.value.toUpperCase();
    var key = req.params.key;
    logger.info("key:" + key + " value:" + value);
    var sortName = req.params.sortName;
    var sortType = req.params.sortType;
    var orderBy = "asc";
    if (sortType === 'true') {
        orderBy = "desc";
    }
    
    // res.json([{"200":"success"}]);
// Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }


        // SQL Query > Select Data
        var sql = "select a.industry_number, r.trade_date, orderbook_id, security_symbol, a.pe_ratio, a.pbv, book_value, ";
        sql += "earning_per_share, dividend_per_share, last_traded_price, r.index_name, r.pe_ratio pe_rindex, a.sector_number, ";
        sql += "r.pbv pbv_rindex, r.dividend_yieid yieid_rindex from stock.astsec a inner join stock.rindex r on ";
        sql += "a.industry_number=r.industry_number and a.sector_number = r.sector_number and a.trade_date=r.trade_date ";
        sql += "where a.trade_date=(select max(trade_date) from stock.rindex) and isoddlot='N' and high_index is not null ";
        sql += "and suspend_date ='' and isin_code_nvdr !='' and notice='' ";
        if (key === 'symbol') {
            sql += " and security_symbol='" + value + "'";
        }else if(key === 'bv'){
            sql += " and to_number(book_value,'9999D99999') < " + value;
        }else if(key === 'pbv'){
            sql += " and to_number(pbv,'9999D99999') < " + value;
        }else if(key === 'eps'){
            sql += " and to_number(earning_per_share,'9999D99999') < " + value;
        }
        if (sortName !== 'security_symbol' && sortName !== 'last_traded_price' && sortName !== 'pe_ratio') {
            sql += " order by to_number(" + sortName + ",'999D99999') " + orderBy;
        } else {
            sql += " order by " + sortName + " " + orderBy;
        }

        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
};


// Get list of astsecs
exports.index = function (req, res) {
    var sortName = req.params.sortName;
    var sortType = req.params.sortType;
    var value = req.params.value.toUpperCase();
    var key = req.params.key;
    logger.info("key:" + key + " value:" + value);
    var orderBy = "asc";
    if (sortType === 'true') {
        orderBy = "desc";
    }
    var results = [];
// Get a Postgres client from the connection pool
    pg.connect(connectionString, function (err, client, done) {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
        }

        // SQL Query > Select Data
        var sql = "select a.industry_number, r.trade_date, orderbook_id, security_symbol, a.pe_ratio, a.pbv, book_value, ";
        sql += "earning_per_share, dividend_per_share, case when last_traded_price = 0 then prior_close_price ";
        sql += "else last_traded_price end last_traded_price, r.index_name, r.pe_ratio pe_rindex, a.sector_number, ";
        sql += "r.pbv pbv_rindex, r.dividend_yieid yieid_rindex from stock.astsec a inner join stock.rindex r on ";
        sql += "a.industry_number=r.industry_number and a.sector_number = r.sector_number and a.trade_date=r.trade_date ";
        sql += "where a.trade_date=(select max(trade_date) from stock.rindex) and isoddlot='N' and security_type='S' ";
        sql += "and high_index is not null and suspend_date ='' and isin_code_nvdr !='' and notice='' ";
        sql += " and to_number(book_value,'9999D99999') > 0 ";        
        
        if (key === 'symbol') {
            sql += " and security_symbol='" + value + "'";            
        }else if(key === 'bv'){
            sql += " and to_number(book_value,'9999D99999') < " + value;
        }else if(key === 'pbv'){
            
            sql += " and to_number(a.pbv,'9999D99999') < " + value;
        }else if(key === 'eps'){
            sql += " and to_number(earning_per_share,'9999D99999') < " + value;
        }
        
        if (sortName !== 'security_symbol' && sortName !== 'last_traded_price' && sortName !== 'pe_ratio') {
            sql += " order by to_number(" + sortName + ",'999D99999') " + orderBy;
        } else {
            sql += " order by " + sortName + " " + orderBy;
        }

//        sql += " order by " + sortName + " " + orderBy;
        logger.info(sql);
        var query = client.query(sql);

        // Stream results back one row at a time
        query.on('row', function (row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.json(results);
        });

    });
};
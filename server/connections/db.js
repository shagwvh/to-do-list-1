/*
 *
 * Dependencies
 *
 * */
const bluebird = require('bluebird');
const mysql = require('mysql2/promise');
/*
 *
 * Config
 *
 * */
const config = require('../config');
/*
 *
 * Connection Config
 *
 * */
const mysqlHost = config.host;
const mysqlUser = config.mysql_user;
const mysqlPassword = config.mysql_password;
const mysqlDb = config.mysql_db;
/*
 *
 * Connection Options
 *
 * */


const options = {
    connectionLimit: config.connection_pool,
    host: mysqlHost,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDb,
    multipleStatements: true,
    Promise: bluebird,
};
/*
 *
 * Pool
 *
 * */
const pool = mysql.createPool(options);
/*
 *
 * Standard Errors
 *
 * */
const CONNECTION_LOST = 'PROTOCOL_CONNECTION_LOST';
// const CONNECTION_COUNT = 'ER_CON_COUNT_ERROR';
// const CONNECTION_DENIED = 'ECONNREFUSED';
const EPIPE = 'EPIPE';
/*
 *
 * Mysql Pool Wrapper
 * Handling connection errors
 *
 * */
const wrapper = {};
/*
 *
 * Query
 *
 * */
wrapper.query = (queryString, queryArgs) => {
    return pool.query(queryString, queryArgs).catch((err) => {
        // handle connection lost and fd errors
        if (err.code === CONNECTION_LOST || err.code === EPIPE) {
            return wrapper.query(queryString, queryArgs);
        }
        return Promise.reject(err);
    });
};
/*
 *
 * Escape
 * Connection
 *
 * */
wrapper.escape = (input) => pool.escape(input);
wrapper.getConnection = () => pool.getConnection();
/*
 *
 * Resolution
 *
 * */
module.exports = wrapper;

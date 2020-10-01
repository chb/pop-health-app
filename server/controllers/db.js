const sqlite3 = require("sqlite3");
const debug   = require("debug")("DB");

/**
 * @type {*}
 */
const DB = new sqlite3.Database(`${__dirname}/../database.db`);

/**
 * Calls database methods and returns a promise
 * @param {string} method
 * @param {*[]} args
 */
DB.promise = (method, ...args) =>
{
    return new Promise((resolve, reject) => {
        debug("SQL: ", method, "\nparams: ", args);
        DB[method](...args, (error, result) => {
            if (error) {
                debug(error);
                return reject(error);
            }
            debug(result);
            resolve(result);
        });
    });
};

module.exports = DB;

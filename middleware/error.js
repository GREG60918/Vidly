const winston = require('winston');

module.exports = function(err, req, res, next) {
    winston.error({ message: err.message, metadata: err }); // this will log in mongodb properly but not in file

    // error
    // warn
    // info
    // verbose
    // debug
    // silly
    
    res.status(500).send('Something failed.');
}
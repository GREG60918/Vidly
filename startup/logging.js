const winston = require('winston');
require('winston-mongodb');

module.exports = function() {
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }), // THIS FORMATTINGDOESNT WORK
        new winston.transports.File({ filename: 'uncaughtExceptions.log' }));
    //winston.rejections.handle(new winston.transports.File({ filename: 'unhandledRejections.log' })); // NOT CURRENTLY AVAILABLE

    process.on('unhandledRejection', (ex) => {
        throw ex;
    });

    winston.add(new winston.transports.Console());
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    winston.add(new winston.transports.MongoDB({
        db: 'mongodb://localhost/vidly',
        level: 'error', // only log errors in mongodb
        options: {
            useUnifiedTopology: true,
        }
    }));

    //throw new Error('Something failed during startup!'); // testing uncaught exceptions
    //const p = Promise.reject(new Error('Something failed miserably!')); // testingunhandled promise rejection
    //p.then(() => console.log('Done'));
}
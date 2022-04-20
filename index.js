const winston = require('winston');
const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
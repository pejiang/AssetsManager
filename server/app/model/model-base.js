import config from '../config'
var instance = require('./model-'+config.db);
    instance.type = config.db;
module.exports = instance;
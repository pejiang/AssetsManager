import config from '../config'
const instance = require('./model-'+config.db);
    instance.type = config.db;
module.exports = instance;
// const modelInstance = instance.modelbase;
// export default modelInstance
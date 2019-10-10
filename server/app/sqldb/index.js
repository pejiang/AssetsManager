// 这里采用sequelize这个框架 这个框架就是数据库的orm框架，意思就是通过定义对象的形式，框架映射成底层原生sql语言来执行
'use strict';

import config from '../config';
import { Sequelize } from "sequelize";// 引入orm
const Op = Sequelize.Op;
const db = {};
const sequelize = new Sequelize(
  config.mysql['database'],
  config.mysql['username'],
  config.mysql['password'], {
    host: config.mysql['host'],
    dialect: 'mysql',
    logging: true,
    freezeTableName: false,
    clientMinMessages: "warning; set client_encoding='latin1'", // hack overwrite client encoding, because pg lib do not provide any method
    // operatorsAliases: {
    //   $and: Op.and,
    //   $or: Op.or,
    //   $eq: Op.eq,
    //   $gt: Op.gt,
    //   $lt: Op.lt,
    //   $lte: Op.lte,
    //   $like: Op.like,
    //   $regexp: Op.regexp
    // },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
db.sequelize = sequelize;
db.asset = db.sequelize.import('../model/asset_table'); // 引入model 数据user表
db.status = db.sequelize.import('../model/status_table');
db.position = db.sequelize.import('../model/position_table');
db.asset.hasMany(db.status, {as: 'status', foreignKey: 'asset_id', onDelete: 'cascade'}); // underscore 也可以生成asset_id
db.asset.hasMany(db.position, {as: 'pos_hist', foreignKey: 'asset_mac', onDelete: 'cascade', onUpdate: 'NO ACTION', sourceKey: 'mac'});
db.sequelize.sync({alter:true});
export {db};
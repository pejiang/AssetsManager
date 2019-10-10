// var parent = require('./model-base')({
//     name : "assets",
//     fields: ["name", "mac", "stats", "position", "battery"]
// });'use strict';
const Sequelize = require('sequelize');
const table = {
    id:{type: Sequelize.BIGINT, primaryKey:true, allowNull: false},
    name: {type: Sequelize.STRING},
    mac: {type: Sequelize.STRING, allowNull: false, unique: true, validate:{
        is:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    }},
    // status: {type: Sequelize.STRING},
    position: {type: Sequelize.STRING},
    battery: {type: Sequelize.STRING},
    count: {type: Sequelize.INTEGER},
    owner: {type: Sequelize.STRING},
    type: {type: Sequelize.STRING},
    dept: {type: Sequelize.STRING},
    price: {type: Sequelize.DOUBLE},
    note: {type:Sequelize.STRING},
    image: {type: Sequelize.STRING}
};

module.exports = function(sequelize, DataTypes) {
    var ap = sequelize.define('asset', table, {
        timestamps: false,
        paranoid: true,//逻辑删除
        freezeTableName: true
    });
    return ap;
};

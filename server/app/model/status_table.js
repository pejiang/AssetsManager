'use strict';
const Sequelize = require('sequelize');
const table = {
    uid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    why: {type: Sequelize.STRING},
    by: {type: Sequelize.STRING},
    time: {type: Sequelize.BIGINT}
};

module.exports = function(sequelize, DataTypes) {
    var ap = sequelize.define('status', table, {
        timestamps: false,
        freezeTableName: true
    });
    return ap;
};

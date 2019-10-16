'use strict';
const Sequelize = require('sequelize');
const table = {
    uid: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    history: {type: Sequelize.STRING},
    time: {type: Sequelize.BIGINT}
};

module.exports = function(sequelize, DataTypes) {
    var ap = sequelize.define('position', table, {
        timestamps: false,
        freezeTableName: true
    });
    return ap;
};

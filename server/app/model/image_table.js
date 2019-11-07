'use strict';
const Sequelize = require('sequelize');
const table = {
    uid: {type: Sequelize.BIGINT, primaryKey: true},
    url: {type: Sequelize.STRING}
};

module.exports = function(sequelize, DataTypes) {
    var ap = sequelize.define('image', table, {
        timestamps: false,
        freezeTableName: true
    });
    return ap;
};

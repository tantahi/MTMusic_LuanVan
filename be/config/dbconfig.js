//Environment variables
require('dotenv').config();

const { Sequelize, DataTypes, Model } = require('sequelize');   
    // Initialize Sequelize
    const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: 'postgres',
    });
module.exports = {sequelize, DataTypes, Model}
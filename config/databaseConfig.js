require("reflect-metadata");
const { DataSource } = require("typeorm");
const  Usuario  = require("../models/usuario");
require("dotenv").config();

const isTest = process.env.NODE_ENV === 'test';

const Product = require('../models/Product');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTest ? `${process.env.TEST_DATABASE_PATH}` : `${process.env.DATABASE_PATH}` ,
  entities: [Usuario, Product, Category, Tag],
  synchronize: true,
  logging: false,
});

const iniciarServer = async () => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
  
  }
};

module.exports = { iniciarServer, AppDataSource };

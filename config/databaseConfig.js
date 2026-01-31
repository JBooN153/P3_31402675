require("reflect-metadata");
const { DataSource } = require("typeorm");
const  Usuario  = require("../models/usuario");
require("dotenv").config();

const isTest = process.env.NODE_ENV === 'test';

const Product = require('../models/Product');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTest ? `${process.env.TEST_DATABASE_PATH}` : `${process.env.DATABASE_PATH}` ,
  entities: [Usuario, Product, Category, Tag, Order, OrderItem],
  synchronize: true,
  logging: false,
});

const iniciarServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
  } catch (error) {
    console.error('❌ Error al conectar la base de datos:', error.message);
    // Solo hacer exit si no es un test
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error; // Re-lanzar el error para que los tests lo capturen
  }
};

module.exports = { iniciarServer, AppDataSource };

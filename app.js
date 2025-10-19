var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./P3_31402675/routes/index');
var usersRouter = require('./P3_31402675/routes/users');

var app = express();


const app = require('./app');
const request = require('supertest');

app.get('/about', (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      nombreCompleto: "Jose Gregorio Sanchez Seijas",
      cedula: "31402675",
      seccion: "2"
    }
  });
});

app.get('/ping', (req, res) => {
  res.sendStatus(200);
});


const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


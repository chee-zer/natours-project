const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
const port = 3000;

//Middlewares

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json()); //move to routers?
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;

const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.url} in server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

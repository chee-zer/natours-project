const AppError = require('./../utils/appError');
const dotenv = require('dotenv').config({ path: './config.env' });

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate error`;
  return new AppError(message, 400);
};

const errorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(`\u001b[31m ERROR: ${err}\u001b[0m`);

    res.status(500).json({
      status: 'error',
      message: 'something went wrong 🙁',
    });
  }
};

const errorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    errorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);

    errorProd(error, res);
  } else {
    console.log(`${process.env.NODE_ENV}a`);
    res.send('something happened');
  }
};

module.exports = globalErrorHandler;

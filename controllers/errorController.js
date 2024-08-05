const AppError = require('./../utils/appError');
const dotenv = require('dotenv').config({ path: './config.env' });

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const existingName = err.errmsg.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/);
  const message = `Invalid data, matches with: ${existingName}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid Token, Please login again!', 401);
};

const handleTokenExpireError = (err) => {
  return new AppError('Your token has expired. Please login again', 401);
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
    if (err.name === `ValidationError`) error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpireError(error);

    errorProd(error, res);
  } else {
    res.send('something happened');
  }
};

module.exports = globalErrorHandler;

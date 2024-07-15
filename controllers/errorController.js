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

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    errorDev(err, res);
  } else if (process.env.NODE_ENV === 'PRODUCTION') {
    errorProd(err, res);
  }
};

module.exports = globalErrorHandler;

const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not yet defined',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  // find user by req.user.id
  const user = await User.findById(req.user.id);

  const { name, email } = req.body;

  if (!email && !name) {
    return next(new AppError('Please enter your data'), 400);
  }
  // save the data in DB
  const updatedData = await User.findByIdAndUpdate(
    user.id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  );

  //send updatedData to client
  res.status(200).json({
    status: 'success',
    updatedData,
  });
});

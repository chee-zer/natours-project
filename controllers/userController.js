const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    users,
  });
});

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

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user)
    return next(
      new AppError(
        'You are not logged in. Please log in to access the route',
        401,
      ),
    );

  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

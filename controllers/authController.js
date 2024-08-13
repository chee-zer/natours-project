const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,

    //testing
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //first check if email and password exist
  if (!email || !password)
    return next(new AppError('Please enter your email and password', 400));
  //then check if they are in the database
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Please enter valid username or password', 401));
  //send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //first we have to check if the token exists

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to view content'),
    );

  //check the verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const freshUser = await User.findById(decoded.id);
  console.log(decoded);
  console.log(freshUser.passwordChangedAt);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token does not exist'),
      401,
    );

  //check if da user changed the da password
  if (freshUser.passwordChangedAfterwards(decoded.iat)) {
    return next(new AppError('Password was changed. Please login in again'));
  }

  //all checks over, send updated data to subsequent middleware
  req.user = freshUser;
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You dont have access to this path'), 403);

    next();
  };
};

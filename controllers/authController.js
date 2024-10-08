const crypto = require('crypto');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,

    // testing
    // passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role,
  });

  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //first check if email and password exist
  if (!email || !password)
    return next(new AppError('Please enter your email and password', 400));

  passwordhashed = await bcrypt.hash(password, 12);
  console.log(passwordhashed);
  //then check if they are in the database
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Please enter valid username or password', 401));
  //send token to client
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  console.log(`Authorization Header: ${req.headers.authorization}`);
  //first we have to check if the token exists

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(`Extracted Token: ${token}`);
  }

  console.log(`Token null before check: ${token}`);

  if (!token) {
    console.log(`Token not found, returning error`);
    return next(
      new AppError('You are not logged in! Please log in to view content'),
    );
  }

  console.log(`Token null after check: ${token}`);

  //check the verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exists
  const freshUser = await User.findById(decoded.id);
  console.log(decoded + ' protect function log btw');

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

//first get user email from req, check if user exists, create a token(refer to mongoose instance method), then return password reset token
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('No user found with this email address', 404));

  const resetToken = user.createPasswordResetToken();

  //turning validation off to get rid of password requirement
  //validate runs as the first pre-save hook when a document is saved
  await user.save({ validateBeforeSave: false });

  //send the token to the user, unhashed obv
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `submit a PATCH request with password and confirmPassword to: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password for natours',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later'),
      500,
    );
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  //check if the user corresponding to the token exists
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if token has not expired and the user exists, set the new password
  if (!user)
    return next(new AppError('User not found! Invalid or Expired token'), 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  console.log(`here`);

  await user.save();

  //Log in the user, send JWT
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //since the user has logged in, so after protect function, thus we have the user in the request body
  const user = await User.findById(req.user.id).select('+password');

  //check password
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError(
        'The Current password is wrong. Please enter the correct password',
        401,
      ),
    );
  }

  //now update the password
  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordNewConfirm;

  //findByIdAndUpdate will not work, reason in validator part in userModel
  await user.save();

  //then sign the token
  sendToken(user, 200, res);
});

const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please provide a valid Email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    //the this keyword only works for save and create, not update
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Doesnt match the password. Please enter the same as password',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

//hash the password both when changing and creating passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
~(
  //change passwordChangedAt
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    /*
  we subtract a second here to prevent the token being issued before passwordChangedAt.
  even tho the execution is paused by await, the database operations are not truly synchronous and operate asynchronously at a lower level.
  this added with the small delays between when the write operation completes and the data is fully propagated for read operations.

  This is a good example of defensive programming, which adds a small buffer to account for potential edge cases or race conditions
  that can occur in a real world, high load application
  */
    this.passwordChangedAt = Date.now() - 1000;
    next();
  })
);

//instance method to check password
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//if jwt was issued before password was changed, then return true
userSchema.methods.passwordChangedAfterwards = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = this.passwordChangedAt.getTime() / 1000;
    if (JWTTimestamp < changedTime) {
      return true;
    }
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //set the expiry to 10 minutes after the reset token is created
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

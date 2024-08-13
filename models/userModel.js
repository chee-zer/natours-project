const mongoose = require('mongoose');
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
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Doesnt match the password. Please enter the same as password',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  console.log(`here`);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfterwards = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTime = this.passwordChangedAt.getTime() / 1000;
    if (JWTTimestamp < this.passwordChangedAt) {
      return true;
    }
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

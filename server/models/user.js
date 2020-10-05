const Mongoose = require('mongoose');
const Crypto = require('crypto');
const Jwt = require('jsonwebtoken');

const Config = require('../config');
const utils = require('@base/utils');

const UserSchema = new Mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  isActive: { type: Boolean },
  confirmedAt: { type: Date },
  roles: [{ type: String }]
});

const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha512';

UserSchema.statics.AdminRole = 'admin';

UserSchema.statics.validateToken = token => {
  let decoded = null;

  try {
    decoded = Jwt.verify(token, Config.appKey);
  } catch (error) {
    if (error.name === 'TokenExpiredError') return { valid: true, expired: true };

    return { valid: false };
  }

  const expirationDate = new Date(decoded.exp * 1000);

  if (new Date() > expirationDate) {
    return { valid: true, expired: true };
  }

  return {
    valid: true,
    data: decoded,
    expired: false
  };
};

UserSchema.statics.hashPassword = async (password, salt) => {
  return new Promise((resolve, reject) => {
    if (!salt) {
      salt = Crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
    }

    Crypto.pbkdf2(password, salt, Iterations, PasswordLength, Digest, (error, hash) => {
      if (error) return reject(error);

      const hashed = [salt, Iterations.toString(), hash.toString('hex')].join('.');

      resolve(hashed);
    });
  });
};

UserSchema.statics.create = async function (email, password, isActive = true, roles = []) {
  const user = new User({
    email: email,
    password: password,
    isActive: isActive,
    confirmedAt: null,
    roles: roles
  });

  user.password = await User.hashPassword(password);
  await user.save();

  return user;
};

UserSchema.statics.verifyUser = async function (token) {
  const validated = User.validateToken(token);

  if (!validated.valid || !validated.data) throw new utils.CustomError('Token invalid');
  if (validated.expired) throw new utils.CustomError({ message: 'Confirmation url expired', expired: true });

  const user = await User.findById(validated.data.userId);

  if (!user) throw new utils.CustomError('User not found');
  if (user.confirmedAt) throw new utils.CustomError({ message: 'User already confirmed', alreadyConfirmed: true });

  user.confirmedAt = new Date();
  await user.save();

  return user;
};

UserSchema.statics.setNewPassword = async function (token, password, confirmation) {
  if (password !== confirmation) throw new utils.CustomError('Password and confirmation does not match');

  const validated = User.validateToken(token);

  if (!validated.valid) throw new utils.CustomError('Token invalid');
  if (validated.expired) throw new utils.CustomError({ message: 'Confirmation url expired', expired: true });

  const user = await User.findById(validated.data.userId);

  if (!user) throw new utils.CustomError('User not found');

  if (!user.confirmedAt) {
    user.confirmedAt = new Date();
  }

  user.password = await User.hashPassword(password);

  await user.save();

  return user;
};

UserSchema.statics.assignRoles = async function (userId, roles = []) {
  const user = await User.findById(userId);
  if (!user) throw new utils.CustomError('User not found');

  user.roles = Array.from(new Set([].concat(roles).concat(user.roles)));
  await user.save();

  return user;
};

UserSchema.methods.checkPassword = async function (password) {
  const parts = this.password.split('.');

  if (parts.length !== 3) throw new utils.CustomError('Password missing or incorrect');

  const salt = parts[0];

  const hashed = await User.hashPassword(password, salt);
  if (hashed !== this.password) throw new utils.CustomError('Password mismatch');

  return this;
};

UserSchema.methods.generateConfirmationToken = function () {
  const data = { userId: this._id.toString() };
  return Jwt.sign(data, Config.appKey, Config.jwtOptions);
};

UserSchema.methods.hasRole = function (role) {
  return this.roles.indexOf(role) !== -1;
};

const User = Mongoose.model('User', UserSchema, 'users');

module.exports = User;

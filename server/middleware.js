const path = require('path');
const jwt = require('jsonwebtoken');
const express = require('express');
const history = require('connect-history-api-fallback');
const compression = require('compression');

const config = require('@base/config');
const logger = require('@base/logger');
const User = require('@models/user');
const BlacklistedToken = require('@base/models/blacklisted-token');
// const ApiCallLog = require('./models/api-call-log');

module.exports = exports = {};

exports.userTokenMiddleware = async (req, res, next) => {
  if (!req.token) return next(null);

  try {
    const blacklistedToken = await BlacklistedToken.findOne({ token: req.token });

    if (blacklistedToken) return res.boom.forbidden('Forbidden', { success: false, message: 'Token invalid' });

    const decoded = jwt.verify(req.token, config.appKey);
    req.user = await User.findById(decoded.userId);

    logger.debug(`userTokenMiddleware: decoded token: ${JSON.stringify(decoded)}`);
    logger.debug(`userTokenMiddleware: user: ${JSON.stringify(req.user)}`);
  } catch (error) {
    logger.error(`User token middleware error: ${error}`);
  }

  next(null);
};

// exports.apiCallLoggingMiddleware = async (req, res, next) => {
//   if (req.method === 'GET') return next(null);

//   const body = JSON.parse(JSON.stringify(req.body || {}));
//   delete body['access_token'];

//   const query = JSON.parse(JSON.stringify(req.query || {}));
//   delete query['access_token'];

//   const params = JSON.parse(JSON.stringify(req.params || {}));

//   const log = new ApiCallLog({
//     url: req.baseUrl,
//     method: req.method,
//     body,
//     query,
//     params,
//     user: req.user ? req.user._id.toString() : null,
//     date: new Date()
//   });

//   await log.save();
//   next(null);
// };

exports.loginRequired = (req, res, next) => {
  logger.debug(`loginRequired: Current user: ${JSON.stringify(req.user)}`);

  if (!req.user) {
    return res.boom.unauthorized('Unauthorized', { success: false, message: 'Authentication required' });
  }

  if (!req.user.isActive || !req.user.confirmedAt) {
    return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });
  }

  logger.info(`User check passed`);

  next(null);
};

exports.adminRequired = (req, res, next) => {
  if (!req.user) {
    return res.boom.unauthorized('Unauthorized', { success: false, message: 'Authentication required', redirect: '/' });
  }

  if (!req.user.isActive || !req.user.confirmedAt) {
    return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });
  }

  if (!req.user.hasRole(User.AdminRole)) {
    return res.boom.forbidden('Forbidden', { success: false, message: 'Admin privileges required', redirect: '/' });
  }

  next(null);
};

exports.redirectToHttps = (req, res, next) => {
  if (process.env.HEROKU_APP_NAME) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
    }
  }

  return next();
};

// STATIC CONTENT serving

exports.compression = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
});

exports.staticFileMiddleware = express.static(path.join(__dirname, '../client/dist'));

exports.history = history({
  disableDotRule: true,
  verbose: true
});

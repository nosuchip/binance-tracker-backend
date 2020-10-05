const path = require('path');
const jwt = require('jsonwebtoken');
const express = require('express');
const historyFactory = require('connect-history-api-fallback');
const compressionFactory = require('compression');

const config = require('@base/config');
const logger = require('@base/logger');

const { User } = require('../db');

const userTokenMiddleware = async (req, res, next) => {
  if (!req.token) return next(null);

  try {
    const decoded = jwt.verify(req.token, config.appKey);
    req.user = await User.findOne({ where: { id: decoded.userId } });

    logger.verbose(`userTokenMiddleware: decoded token: ${JSON.stringify(decoded)}, user: ${JSON.stringify(req.user)}`);
  } catch (error) {
    logger.error(`User token middleware error: ${error}`);
  }

  next(null);
};

const loginRequired = (req, res, next) => {
  logger.verbose(`loginRequired: Current user: ${JSON.stringify(req.user)}`);

  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!req.user.active || !req.user.confirmedAt) {
    return res.status(401).json({ success: false, message: 'User not confirmed or inactive' });
  }

  logger.info('User check passed');

  next(null);
};

const adminRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required', redirect: '/' });
  }

  if (!req.user.active || !req.user.confirmedAt) {
    return res.status(401).json({ success: false, message: 'User not confirmed or inactive' });
  }

  if (!req.user.hasRole(User.AdminRole)) {
    return res.status(401).json({ success: false, message: 'Admin privileges required', redirect: '/' });
  }

  next(null);
};

const redirectToHttps = (req, res, next) => {
  if (process.env.HEROKU_APP_NAME) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
    }
  }

  return next();
};

// STATIC CONTENT serving

const compression = compressionFactory({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compressionFactory.filter(req, res);
  }
});

const staticFileMiddleware = express.static(path.join(__dirname, '../../client/dist'));

const history = historyFactory({
  disableDotRule: true,
  verbose: true
});

module.exports = {
  userTokenMiddleware,
  loginRequired,
  adminRequired,
  redirectToHttps,
  compression,
  staticFileMiddleware,
  history
};

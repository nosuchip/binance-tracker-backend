const jwt = require('jsonwebtoken');

const config = require('@base/config');

const decode = (token) => {
  try {
    const decoded = jwt.verify(token, config.appKey);

    return decoded;
  } catch (error) {
    return {};
  }
};

module.exports = {
  decode
};

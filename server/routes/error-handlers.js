const logger = require('../logger');

module.exports = exports = {};

exports.error = async function (err, req, res, next) {
  logger.exception(err);
  return res.boom.internal(err.toString(), { success: false, message: err.message || err.toString() });
};

exports.notFound = function (req, res, next) {
  logger.error(`Endpoint ${req.method} ${req.url} not found`);
  return res.boom.notFound('Not found', { success: false, message: 'Requested page not found.' });
};

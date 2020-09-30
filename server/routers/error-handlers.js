const logger = require('../logger');

module.exports = exports = {};

exports.error = async function (err, req, res, next) {
  logger.exception(err);
  return res.status(500).json({ success: false, message: err.message || err.toString() });
};

exports.notFound = function (req, res, next) {
  logger.error(`Endpoint ${req.method} ${req.url} not found`);
  return res.status(404).json({ success: false, message: 'Requested page not found.' });
};

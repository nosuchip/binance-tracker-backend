const NodeCache = require('node-cache');

const Config = require('./config');

module.exports = exports = {};

exports.urlCache = new NodeCache(Config.cache.urlCacheOptions);

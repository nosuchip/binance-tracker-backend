const mongoose = require('mongoose');
const config = require('./config');
const gridFS = require('gridfs-stream');
const logger = require('./logger');

module.exports.db = null;
module.exports.gfs = null;

module.exports.initialize = async () => {
  return new Promise((resolve, reject) => {
    const options = { useNewUrlParser: true };

    mongoose.connect(config.databaseUri, options);
    module.exports.db = mongoose.connection;

    module.exports.db.on('error', reject);
    module.exports.db.once('open', () => {
      module.exports.gfs = gridFS(module.exports.db.db, mongoose.mongo);
      resolve();
    });

    if (config.debug) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`${collectionName}.${method}( ${JSON.stringify(query)} ) = ${JSON.stringify(doc)}`);
      });
    }
  });
};

module.exports.shutdown = async () => {
  if (module.exports.db) {
    await module.exports.db.close();
    module.exports.db = null;
  }
};

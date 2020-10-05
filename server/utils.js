const util = require('util');

function CustomError (opts) {
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;

  opts || (opts = {});

  if (typeof opts === 'string') {
    this.message = opts;
    return;
  }

  for (const key in opts) {
    if (Object.prototype.hasOwnProperty.call(opts, key)) {
      this[key] = opts[key];
    }
  }
}

util.inherits(CustomError, Error);

module.exports = exports = {
  CustomError
};

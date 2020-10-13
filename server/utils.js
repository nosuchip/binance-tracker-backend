const util = require('util');

const DEFAULT_PER_PAGE = 20;

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

const unpackQuery = (req = {}) => {
  const page = parseInt(req.page) || 0;
  const perPage = parseInt(req.perPage) || DEFAULT_PER_PAGE;
  const filter = req.filter || '';
  const offset = page * perPage;

  return { page, perPage, filter, offset };
};

const paginate = (query, opts = {}) => {
  let { offset, perPage } = unpackQuery(opts.req);

  if (typeof offset === 'undefined') {
    if (typeof opts.offset !== 'undefined') {
      offset = opts.offset;
    } else {
      offset = 0;
    }
  }

  if (typeof perPage === 'undefined') {
    if (typeof opts.perPage !== 'undefined') {
      perPage = opts.perPage;
    } else {
      perPage = DEFAULT_PER_PAGE;
    }
  }

  return {
    ...query,
    offset,
    limit: perPage
  };
};

const arrayToDict = (arr, key) => {
  return arr.reduce((acc, item) => {
    const itemKey = item[key].toString ? item[key].toString() : item[key];
    acc[itemKey] = item;
    return acc;
  }, {});
};

module.exports = exports = {
  CustomError,
  unpackQuery,
  paginate,
  arrayToDict
};

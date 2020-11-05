const { ConnectionString } = require('connection-string');
const parsed = new ConnectionString(process.env.DATABASE_URI);

const resolver = {
  get: () => ({
    username: parsed.user,
    password: parsed.password,
    database: parsed.path[0],
    host: parsed.hostname,
    port: parsed.port,
    dialect: parsed.protocol,

    // HEroku Posgres-specific
    dialectOptions: {
      ssl: {
          rejectUnauthorized: false
      }
    },
    quoteIdentifiers: true, // set case-insensitive
  })
};

module.exports = new Proxy({}, resolver);

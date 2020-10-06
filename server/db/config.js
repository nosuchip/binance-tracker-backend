const { ConnectionString } = require('connection-string');
const parsed = new ConnectionString(process.env.MYSQL_URI);

const resolver = {
  get: () => ({
    username: parsed.user,
    password: parsed.password,
    database: parsed.path[0],
    host: parsed.hostname,
    port: parsed.port,
    dialect: 'mysql'
  })
};

module.exports = new Proxy({}, resolver);

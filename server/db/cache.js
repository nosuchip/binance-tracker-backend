const VariableAdaptor = require('sequelize-transparent-cache-variable');
const sequelizeCache = require('sequelize-transparent-cache');

const variableAdaptor = new VariableAdaptor({
  store: {}
});
const { withCache } = sequelizeCache(variableAdaptor);

module.exports = {
  withCache
};

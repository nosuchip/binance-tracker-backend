const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');
const { afterCreate, afterUpdate, afterDestroy } = require('@db/hooks/signal-hooks');

const SignalStatus = {
  Delayed: 'delayed',
  Active: 'active',
  Finished: 'finished',
  Cancelled: 'cancelled'
};

const SignalType = {
  Long: 'long',
  Short: 'short'
};

class Signal extends Model {
  static empty (overloads = {}) {
    return {
      status: 'active',
      profitability: 0,
      // ticker: 'BTCUSDT',
      // title: 'BTC/USDT',
      // type: 'long',
      risk: 'low',
      term: 'long',
      volume: 0,
      paid: false,
      commentable: true,
      // userId: admin.id
      remaining: overloads.remaining || 1.0,
      channel: '',

      ...overloads
    };
  }

  static async findOneWithRefs (query) {
    const signal = await Signal.findOne(query);
    const comments = await signal.getComments();
    const entryPoints = await signal.getEntryPoints();
    const orders = await signal.getOrders();

    const takeProfitOrders = orders.filter(order => order.type === 'take profit');
    const stopLossOrders = orders.filter(order => order.type === 'stop loss');

    return {
      signal,
      comments,
      entryPoints,
      orders,
      takeProfitOrders,
      stopLossOrders
    };
  }

  static async findManyWithRefs (query, opts = {}) {
    const { skipComments, skipEntryPoints, skipOrders } = opts;

    const { count, rows: signals } = await Signal.findAndCountAll(query);

    const results = await Promise.all(
      signals.map(signal => Promise.all([
        skipComments ? [] : signal.getComments(),
        skipEntryPoints ? [] : signal.getEntryPoints(),
        skipOrders ? [] : signal.getOrders()
      ]).then(([comments, entryPoints, orders]) => {
        const takeProfitOrders = orders.filter(order => order.type === 'take profit');
        const stopLossOrders = orders.filter(order => order.type === 'stop loss');

        return { signal, comments, entryPoints, orders, takeProfitOrders, stopLossOrders };
      }))
    );

    return { count, signals: results };
  }

  static async activateMany (signalPriceList) {
    return Promise.all(signalPriceList.map(({ id, price }) => Signal.update(
      { status: SignalStatus.Active, price, pastPrice: price },
      { where: { status: SignalStatus.Delayed, id } }
    )));
  }
}

Signal.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM(Object.values(SignalStatus)), allowNull: false },
  profitability: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  exitPrice: { type: DataTypes.DECIMAL(16, 8), allowNull: true },
  ticker: { type: DataTypes.STRING(50), allowNull: false },
  title: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.ENUM(Object.values(SignalType)), allowNull: false },
  risk: { type: DataTypes.ENUM('high', 'medium', 'low'), allowNull: false },
  term: { type: DataTypes.ENUM('short', 'medium', 'long'), allowNull: false },
  volume: { type: DataTypes.DECIMAL(16, 8), allowNull: false },
  paid: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  commentable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  price: { type: DataTypes.DECIMAL(16, 8), allowNull: true },
  lastPrice: { type: DataTypes.DECIMAL(16, 8), allowNull: true },
  post: { type: DataTypes.STRING(1024), allowNull: true },
  remaining: { type: DataTypes.DECIMAL(4, 3), allowNull: false },
  channel: { type: DataTypes.STRING(100), allowNull: true }
}, {
  sequelize,
  modelName: 'Signal',
  hooks: {
    afterCreate,
    afterUpdate,
    afterDestroy
  }
});

module.exports = {
  Signal,
  SignalStatus,
  SignalType
};

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');
const { afterCreate, afterUpdate, afterDestroy } = require('@db/hooks/signal-hooks');
const { Channel } = require('./channel');
const { EntryPoint } = require('./entrypoint');
const { Order } = require('./order');
const { Comment } = require('./comment');

const SignalStatus = {
  Delayed: 'delayed',
  Active: 'active',
  Finished: 'finished',
  Cancelled: 'cancelled',
  Regression: 'regression'
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

      ...overloads
    };
  }

  static async findManyWithRefs (query, opts = {}) {
    const { skipComments, skipEntryPoints, skipOrders, plain } = opts;

    const include = [{
      model: Channel,
      as: 'channel'
    }];

    if (!skipComments) {
      include.push({
        model: Comment,
        as: 'comments'
      });
    }

    if (!skipEntryPoints) {
      include.push({
        model: EntryPoint,
        as: 'entryPoints'
      });
    }

    if (!skipOrders) {
      include.push({
        model: Order,
        as: 'orders'
      });
    }

    query = {
      order: [
        ['id', 'ASC']
      ],

      distinct: true,

      ...query,

      include
    };

    const { count, rows: signals } = await Signal.findAndCountAll(query);

    const results = signals.map(signal => {
      const takeProfitOrders = signal.orders.filter(order => order.type === 'take profit');
      const stopLossOrders = signal.orders.filter(order => order.type === 'stop loss');

      return {
        signal: plain ? signal.get() : signal,
        channel: plain ? signal.comments.map(c => c.get) : signal.comments,
        comments: plain ? signal.comments.map(c => c.get) : signal.comments,
        entryPoints: plain ? signal.entryPoints.map(ep => ep.get()) : signal.entryPoints,
        orders: plain ? signal.orders.map(o => o.get()) : signal.orders,
        takeProfitOrders: plain ? takeProfitOrders.map(o => o.get()) : takeProfitOrders,
        stopLossOrders: plain ? stopLossOrders.map(o => o.get()) : stopLossOrders
      };
    });

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
  remaining: { type: DataTypes.DECIMAL(4, 3), allowNull: false }
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

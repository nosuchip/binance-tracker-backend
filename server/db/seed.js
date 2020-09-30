const { User } = require('@models/user');
const { Signal } = require('@models/signal');
const logger = require('@base/logger');

module.exports = async () => {
  const demoUserData = {
    name: 'Demo User',
    email: 'demo@demo.example',
    password: 'P@ssw0rd',
    role: 'user',
    confirmedAt: new Date(),
    active: true
  };
  const demoAdminData = {
    name: 'Demo Admin',
    email: 'admin@demo.example',
    password: 'P@ssw0rd',
    role: 'admin',
    confirmedAt: new Date(),
    active: true
  };

  let user = await User.findOne({ where: { email: demoUserData.email } });

  if (!user) {
    logger.info('Demo user not found, creating new');
    user = await User.create(demoUserData);
  }

  let admin = await User.findOne({ where: { email: demoAdminData.email } });

  if (!admin) {
    logger.info('Admin user not found, creating new');
    admin = await User.create(demoAdminData);
  }

  const demoSignalsData = [{
    status: 'active',
    profitability: 0,
    ticker: 'BTCUSDT',
    risk: 'low',
    term: 'long',
    volume: 0,
    paid: false,
    commentsAllowed: true,
    price: 10000,
    userId: admin.id
  }, {
    status: 'active',
    profitability: 0,
    ticker: 'ETHUSDT',
    risk: 'low',
    term: 'long',
    volume: 0,
    paid: false,
    commentsAllowed: true,
    price: 360,
    userId: admin.id
  }, {
    status: 'active',
    profitability: 0,
    ticker: 'XRPUSDT',
    risk: 'low',
    term: 'long',
    volume: 0,
    paid: false,
    commentsAllowed: true,
    price: 10000,
    userId: admin.id
  }, {
    status: 'active',
    profitability: 0,
    ticker: 'LTCUSDT',
    risk: 'low',
    term: 'long',
    volume: 0,
    paid: false,
    commentsAllowed: true,
    price: 10000,
    userId: admin.id
  }];

  const signals = [];

  for (const signalData of demoSignalsData) {
    let signal = await Signal.findOne({ where: { ticker: signalData.ticker, price: signalData.price } });

    if (!signal) {
      logger.info(`Creating demo signal ${signalData.ticker}`);
      signal = await Signal.create(signalData);
    }

    signals.push(signal);
  }
};

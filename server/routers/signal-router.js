const _ = require('lodash');
const express = require('express');

const { sequelize, Signal, Comment, EntryPoint, Order, Sequelize, Channel } = require('@db');
const Op = Sequelize.Op;
const { validate, SignalSchema, BulkSignalSchema, CommentSchema } = require('../validation');
const utils = require('@base/utils');
const { safeTicker } = require('@base/libs/ticker');

const router = express.Router();

const getOrCreateChannel = async (name) => {
  let channel = { id: null };

  if (!name) {
    return channel;
  }

  channel = await Channel.findOne({ where: { name } });

  if (!channel) {
    channel = new Channel({ name });
    await channel.save();
  }

  return channel;
};

const getSignalResponse = async (signalId) => {
  const { signals: [{ signal, comments, entryPoints: ep, orders, takeProfitOrders: tp, stopLossOrders: sl }] } = await Signal.findManyWithRefs({
    where: {
      id: signalId
    }
  }, { plain: true });

  const channels = await Channel.findAll({});

  return {
    success: true,
    signal: {
      ...signal,
      comments,
      entryPoints: ep,
      orders,
      takeProfitOrders: tp,
      stopLossOrders: sl
    },
    channels
  };
};

router.get('/signals', async (req, res) => {
  const { page, perPage, filter } = utils.unpackQuery(req);

  const where = {};

  if (filter) {
    where[Op.or] = [
      { ticker: { [Op.like]: `%${filter}%` } },
      { title: { [Op.like]: `%${filter}%` } }
    ];
  };

  const unprivilegedUser = !req.user || !['admin', 'paid user'].includes(req.user.role);

  const query = utils.paginate({ where }, { req });
  let { count, signals } = await Signal.findManyWithRefs(query);

  signals = signals.map(data => ({
    ...data.signal.get(),
    comments: unprivilegedUser ? data.comments.map(c => ({})) : data.comments,
    entryPoints: unprivilegedUser ? [] : data.entryPoints,
    takeProfitOrders: data.takeProfitOrders,
    stopLossOrders: data.stopLossOrders
  }));

  const available = await sequelize.query('SELECT id FROM Signals' + (unprivilegedUser ? ' WHERE paid <> TRUE' : ''), {
    raw: true,
    type: Sequelize.QueryTypes.SELECT
  });

  res.json({
    success: true,
    data: signals,
    pagination: { page, perPage, total: count },
    available: available.map(a => a.id)
  });
});

router.get('/signals/:signalId', async (req, res) => {
  const { signalId } = req.params;

  const response = await getSignalResponse(signalId);
  res.json(response);
});

router.post('/signals', validate(SignalSchema), async (req, res) => {
  const {
    // comments = [],
    entryPoints = [],
    takeProfitOrders = [],
    stopLossOrders = [],
    ...rest
  } = req.body;

  const {
    ticker,
    title,
    price,
    commentable,
    paid,
    type,
    risk,
    term,
    volume,
    date,
    post,
    status,
    profitability,
    channel
  } = rest;

  const channelModel = await getOrCreateChannel(channel ? channel.name : null);

  const created = await Signal.create(Signal.empty({
    userId: req.user.id,
    ticker: safeTicker(ticker),
    title: title || ticker,
    price,
    commentable,
    paid,
    type,
    risk,
    term,
    volume,
    post,
    status,
    profitability,
    createdAt: date,
    channelId: channelModel.id
  }));

  await EntryPoint.bulkCreate(entryPoints.map(ep => ({
    signalId: created.id,
    price: ep.price,
    comment: ep.comment
  })));

  await Order.bulkCreate([...takeProfitOrders, ...stopLossOrders].map(order => ({
    signalId: created.id,
    price: order.price,
    volume: order.volume,
    comment: order.comment,
    type: order.type
  })));

  const response = await getSignalResponse(created.id);
  res.json(response);
});

router.put('/signals/:signalId', validate(SignalSchema), async (req, res) => {
  const { signalId } = req.params;

  const existing = await Signal.findOne({ where: { id: signalId } });

  if (!existing) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  const payload = {};

  const {
    // comments = [],
    entryPoints = [],
    takeProfitOrders = [],
    stopLossOrders = [],
    channel = {},
    ...rest
  } = req.body;

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      payload[key] = value;
    }
  });

  payload.ticker = safeTicker(payload.ticker);

  const channelModel = await getOrCreateChannel(_.get(channel, 'name', null));
  payload.channelId = channelModel.id;

  const transaction = await sequelize.transaction();

  await Promise.all([
    Signal.update(payload, { where: { id: signalId } }, { transaction }),

    EntryPoint
      .destroy({ where: { signalId } }, { transaction })
      .then(() => EntryPoint.bulkCreate(entryPoints), { transaction }),

    Order
      .destroy({ where: { signalId } }, { transaction })
      .then(() => Order.bulkCreate([...takeProfitOrders, ...stopLossOrders]), { transaction })
  ]);

  const response = await getSignalResponse(signalId);
  res.json(response);
});

router.delete('/signals/:signalId', async (req, res) => {
  const { signalId } = req.params;

  const signal = await Signal.findOne({ where: { id: signalId } });

  if (!signal) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  await signal.destroy();

  res.json({ success: true });
});

router.post('/signals/:signalId/comment', validate(CommentSchema), async (req, res) => {
  const { signalId } = req.params;
  const { text } = req.body;

  const comment = await Comment.create({
    signalId,
    text,
    userId: req.user.id
  });

  res.json({ success: true, comment });
});

router.post('/signals/bulk', validate(BulkSignalSchema), async (req, res) => {
  const { signals } = req.body;

  const createdIds = [];

  for (const payload of signals) {
    const {
      entryPoints = [],
      takeProfitOrders = [],
      stopLossOrders = [],
      channel,
      ...rest
    } = payload;

    const {
      ticker,
      title,
      price,
      commentable,
      paid,
      type,
      risk,
      term,
      volume,
      date,
      post,
      status,
      profitability
    } = rest;

    const channelModel = await getOrCreateChannel(channel.name);

    const created = await Signal.create(Signal.empty({
      userId: req.user.id,
      ticker,
      title: title || ticker,
      price,
      commentable,
      paid,
      type,
      risk,
      term,
      volume,
      post,
      status,
      profitability: profitability || 0,
      createdAt: date,
      channelId: channelModel.id
    }));

    createdIds.push(created.id);

    await EntryPoint.bulkCreate(entryPoints.map(ep => ({
      signalId: created.id,
      price: ep.price,
      comment: ep.comment
    })));

    takeProfitOrders.forEach(order => {
      order.type = 'take profit';
    });

    stopLossOrders.forEach(order => {
      order.type = 'stop loss';
    });

    await Order.bulkCreate([...takeProfitOrders, ...stopLossOrders].map(order => ({
      signalId: created.id,
      price: order.price,
      volume: order.volume,
      comment: order.comment,
      type: order.type
    })));
  }

  res.json({
    success: true,
    signalsIds: createdIds
  });
});

module.exports = router;

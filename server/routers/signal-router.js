const express = require('express');

const { sequelize } = require('@db');
const { Signal, Comment, EntryPoint, Order, Sequelize } = require('@db');

const { validate, SignalSchema, BulkSignalSchema, CommentSchema } = require('../validation');
const utils = require('@base/utils');

const router = express.Router();

router.get('/signals', async (req, res) => {
  const { page, perPage, offset } = utils.unpackQuery(req);

  const where = {};

  const unprivilegedUser = !req.user || !['admin', 'paid user'].includes(req.user.role);

  const query = utils.paginate({ where }, { offset, perPage });
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

  const { signal, comments, entryPoints, takeProfitOrders, stopLossOrders } = await Signal.findOneWithRefs({
    where: {
      id: signalId
    }
  });

  res.json({
    success: true,
    signal: {
      ...signal.get(),
      comments,
      entryPoints,
      takeProfitOrders,
      stopLossOrders
    }
  });
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
    profitability,
    createdAt: date,
    channel
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

  const signal = await Signal.findOneWithRefs({
    where: {
      id: created.id
    }
  });

  res.json({
    success: true,
    signal: {
      ...signal.signal.get(),
      comments: signal.comments,
      entryPoints: signal.entryPoints,
      takeProfitOrders: signal.takeProfitOrders,
      stopLossOrders: signal.stopLossOrders
    }
  });
});

router.put('/signals/:signalId', validate(SignalSchema), async (req, res) => {
  const { signalId } = req.params;

  const signal = await Signal.findOne({ where: { id: signalId } });

  if (!signal) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  const payload = {};

  const {
    // comments = [],
    entryPoints = [],
    takeProfitOrders = [],
    stopLossOrders = [],
    ...rest
  } = req.body;

  Object.entries(rest).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      payload[key] = value;
    }
  });

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

  const updated = await Signal.findOneWithRefs({
    where: {
      id: signalId
    }
  });

  res.json({
    success: true,
    signal: {
      ...updated.signal.get(),
      comments: updated.comments,
      entryPoints: updated.entryPoints,
      takeProfitOrders: updated.takeProfitOrders,
      stopLossOrders: updated.stopLossOrders
    }
  });
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
      profitability,
      channel
    } = rest;

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
      channel
    }));

    createdIds.push(created.id);

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
  }

  res.json({
    success: true,
    signalsIds: createdIds
  });
});

module.exports = router;

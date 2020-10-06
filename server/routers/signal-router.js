const express = require('express');

const { Signal } = require('@models/signal');
const { Comment } = require('@models/comment');

const { validate, SignalSchema, CommentSchema } = require('../validation');
const utils = require('@base/utils');

const router = express.Router();

router.get('/signals', async (req, res) => {
  const { page, perPage, offset } = utils.unpackQuery(req);

  const where = {};

  if (!req.user || !['admin', 'paidUser'].includes(req.user.role)) {
    where.paid = false;
  }

  const { count, rows } = await Signal.findAndCountAll(utils.paginate({ where }, { offset, perPage }));

  // TODO: Add list of all available signals for client (it could depends on role and paid status)
  const availableSignals = [];

  res.json({ success: true, data: rows, pagination: { page, perPage, total: count }, availableSignals });
});

router.get('/signals/:signalId', async (req, res) => {
  const { signalId } = req.params;

  const signal = await Signal.findOne({
    where: {
      id: signalId
    }
  });

  const comments = await Comment.findAll({ where: { signalId } });

  res.json({ success: true, signal, comments });
});

router.post('/signals', validate(SignalSchema), async (req, res) => {
  const { ticker, price, commentable, paid } = req.body;

  const exists = await Signal.exists(ticker, price);

  if (exists) {
    return res.status(409).json({ success: false, error: 'Signal already exists' });
  }

  const signal = await Signal.create(Signal.empty({
    ticker,
    price,
    commentable,
    paid
  }));

  res.json({ success: true, signal });
});

router.put('/signals/:signalId', validate(SignalSchema), async (req, res) => {
  const { signalId } = req.params;

  const signal = await Signal.findOne({ where: { id: signalId } });

  if (!signal) {
    return res.status(404).json({ success: false, error: 'Signal not found' });
  }

  const payload = {};

  Object.entries(req.body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      payload[key] = value;
    }
  });

  const result = await signal.update(payload);

  res.json({ success: true, signal, result });
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

module.exports = router;

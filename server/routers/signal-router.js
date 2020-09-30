const express = require('express');

const { Signal } = require('@models/signal');
const { Comment } = require('@models/comment');

const { validate, SignalSchema, CommentSchema } = require('../validation');
const utils = require('@base/utils');

const router = express.Router();

router.get('/signals', async (req, res) => {
  const paid = !!req.query.paid;
  const { page, perPage, offset } = utils.unpackQuery(req);

  const { count, rows } = await Signal.findAndCountAll(utils.paginate({
    where: { paid }
  }, { offset, perPage }));

  res.json({ success: true, data: rows, pagination: { page, perPage, total: count } });
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
  const { ticker, price, commentsAllowed, paid } = req.body;

  const exists = await Signal.exists(ticker, price);

  if (exists) {
    return res.status(409).json({ success: false, error: 'Signal already exists' });
  }

  const signal = await Signal.create(Signal.empty({
    ticker,
    price,
    commentsAllowed,
    paid
  }));

  res.json({ success: true, signal });
});

router.delete('/signals/:signalId', async (req, res) => {
  const { signalId } = req.params;

  await Signal.delete({ where: { id: signalId } });

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

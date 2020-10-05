const express = require('express');

const { Post } = require('@models/post');
const { Comment } = require('@models/comment');

const { validate, SignalSchema } = require('../validation');
const utils = require('@base/utils');

const router = express.Router();

router.get('/posts/signal/:signalId', async (req, res) => {
  const { signalId } = req.params;
  const { page, perPage, offset } = utils.unpackQuery(req);

  const { count, rows } = await Post.findAndCountAll(utils.paginate({
    where: { signalId }
  }, { offset, perPage }));

  res.json({ success: true, data: rows, pagination: { page, perPage, total: count } });
});

router.post('/posts', /* validate(PostSchema) , */ async (req, res) => {

});

router.put('/posts', /* validate(PostSchema) , */ async (req, res) => {

});

router.post('/posts/:postId/comment', /* validate(CommentSchema) , */ async (req, res) => {

});

module.exports = router;

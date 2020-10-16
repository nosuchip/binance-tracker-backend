const express = require('express');

const { Post } = require('@models/post');

const utils = require('@base/utils');

const router = express.Router();

router.get('/posts/signal/:signalId', async (req, res) => {
  const { signalId } = req.params;
  const { page, perPage } = utils.unpackQuery(req);

  const { count, rows } = await Post.findAndCountAll(utils.paginate({
    where: { signalId }
  }, { req }));

  res.json({ success: true, data: rows, pagination: { page, perPage, total: count } });
});

router.post('/posts', /* validate(PostSchema) , */ async (req, res) => {

});

router.put('/posts', /* validate(PostSchema) , */ async (req, res) => {

});

router.post('/posts/:postId/comment', /* validate(CommentSchema) , */ async (req, res) => {

});

module.exports = router;

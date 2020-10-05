const express = require('express');

const middleware = require('../middleware');
const User = require('@models/user');

const router = express.Router();

router.get('/users/', middleware.adminRequired, async (req, res) => {
  return res.json({ success: true, users: await User.find() });
});

module.exports = router;

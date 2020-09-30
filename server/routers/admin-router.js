const express = require('express');

// const middleware = require('../middleware');

const router = express.Router();

router.get('/users/', /* middleware.adminRequired, */ async (req, res) => {
  return res.json({ success: true, users: [] });
});

module.exports = router;

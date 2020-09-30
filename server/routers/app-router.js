const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  res.send('Wanna something?');
});

router.get('/error', function (req, res) {
  // TODO: Remove this method in production. Added only for test purposes.
  throw new Error('Unexpected error happens, call SJW immediately!');
});

module.exports = router;

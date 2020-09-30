const express = require('express');
const Jwt = require('jsonwebtoken');

const { User } = require('@models/user');
const config = require('@base/config');

const { validate, LoginSchema, RegisterSchema } = require('../validation');

const router = express.Router();

router.post('/account/login', validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ success: false, message: `User with email ${email} not found.` });
  }

  if (!user.isActive || !user.confirmedAt) {
    return res.status(403).json({ success: false, message: 'User not confirmed or inactive' });
  }

  await user.checkPassword(password);

  const token = Jwt.sign({ userId: user._id.toString() }, config.appKey, config.jwtOptions);
  res.json({ token: token, isAdmin: user.hasRole(User.AdminRole), success: true });
});

router.post('/account/register', validate(RegisterSchema), async (req, res) => {
  throw new Error('Not implemented');

  // const { email, password } = req.body;

  // res.json({ success: true });
});

module.exports = router;

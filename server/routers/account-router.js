const express = require('express');
const Jwt = require('jsonwebtoken');

const { User } = require('@models/user');
const config = require('@base/config');

const { validate, LoginSchema, RegisterSchema } = require('../validation');
const { loginRequired } = require('@base/middleware/index');
const { checkPassword, hashPassword } = require('@base/libs/password');

const router = express.Router();

router.get('/account/me', loginRequired, async (req, res) => {
  const token = Jwt.sign({ userId: req.user.id }, config.appKey, config.jwtOptions);
  res.json({ success: true, token, user: req.user });
});

router.post('/account/login', validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ success: false, message: `User with email ${email} not found.` });
  }

  if (!user.active || !user.confirmedAt) {
    return res.status(403).json({ success: false, message: 'User not confirmed or inactive' });
  }

  await checkPassword(user.password, password);

  const token = Jwt.sign({ userId: user.id }, config.appKey, config.jwtOptions);
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    active: user.active,
    confirmedAt: user.confirmedAt,
    role: user.role
  };

  res.json({ token: token, user: payload, isAdmin: user.role === 'admin', success: true });
});

router.post('/account/register', validate(RegisterSchema), async (req, res) => {
  throw new Error('Not implemented');

  // const { email, password } = req.body;

  // res.json({ success: true });
});

module.exports = router;

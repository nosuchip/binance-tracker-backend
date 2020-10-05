const express = require('express');
const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');
const Jwt = require('jsonwebtoken');

const User = require('../models/user');
const Config = require('../config');

const { validate, LoginSchema, RegisterSchema, ResetSchema, ResetPasswordSchema, VerifySchema } = require('../validation');

const router = express.Router();
const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

router.post('/login', validate(LoginSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email });
  if (!user) return res.boom.notFound('Not found', { success: false, message: `User with email ${email} not found.` });
  if (!user.isActive || !user.confirmedAt) return res.boom.forbidden('Forbidden', { success: false, message: 'User not confirmed or inactive' });

  await user.checkPassword(password);

  const token = Jwt.sign({ userId: user._id.toString() }, Config.appKey, Config.jwtOptions);
  res.json({ token: token, isAdmin: user.hasRole(User.AdminRole), success: true });
});

router.post('/register', validate(RegisterSchema), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user = await User.findOne({ email: email });
  if (user) return res.boom.conflict('Exists', { success: false, message: `User with email ${email} already exists` });

  user = await User.create(email, password);
  const token = user.generateConfirmationToken();
  const confirmationUrl = Config.siteUrl + 'verify/?token=' + token;

  var mail = {
    from: Config.mailerConfig.from,
    to: user.email,
    subject: 'Email verification',
    template: 'email-verification',
    context: {
      confirmationUrl
    }
  };

  await mailer.sendMail(mail);

  res.json({ userId: user._id.toString(), success: true });
});

router.post('/reset', validate(ResetSchema), async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({ email: email });
  if (!user) return res.boom.notFound('Not found', { success: false, message: 'User not found' });

  const token = await user.generateConfirmationToken();
  const resetUrl = Config.siteUrl + 'reset/?token=' + token;

  var mail = {
    from: Config.mailerConfig.from,
    to: user.email,
    subject: 'Password reset',
    template: 'password-reset',
    context: {
      resetUrl
    }
  };

  await mailer.sendMail(mail);

  res.json({ userId: user._id.toString(), success: true });
});

router.post('/resetpassword/', validate(ResetPasswordSchema), async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirmation = req.body.confirmation;

  try {
    const user = User.setNewPassword(token, password, confirmation);

    if (!user.confirmedAt) {
      user.confirmedAt = new Date();
      await user.save();
    }

    res.json({ userId: user._id.toString(), success: true });
  } catch (error) {
    if (error.expired) return res.boom.resourceGone('Expired', { success: false, expired: true, message: 'Token expired' });
    return res.boom.badData('Token invalid', { success: false, message: 'Invalid token' });
  }
});

router.post('/verify/', validate(VerifySchema), async (req, res) => {
  const token = req.body.token;

  try {
    const user = await User.verifyUser(token);
    res.json({ userId: user._id.toString(), success: true });
  } catch (error) {
    if (error.expired) return res.boom.resourceGone('Expired', { success: false, expired: true, message: 'Token expired' });
    if (error.alreadyConfirmed) return res.boom.conflict('confirmed', { success: false, alreadyConfirmed: true, message: 'User already confirmed' });
    return res.boom.badData('Invalid', { success: false, message: 'Invalid token.' });
  }
});

module.exports = router;

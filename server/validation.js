const Joi = require('joi');

const validate = (schema, source) => {
  return function (req, res, next) {
    if (!source) source = (request) => request.body;

    Joi.validate(source(req, res), schema, { abortEarly: true }, function (err, validationResult) {
      if (err) {
        const details = err.details.map(detail => {
          return detail.message;
        });

        return res.status(400).json({ success: false, details });
      }

      req.schema = schema;
      return next();
    });
  };
};

const LoginSchema = {
  email: Joi.string().required().label('Email'),
  password: Joi.string().required().label('Password')
};

const RegisterSchema = {
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
  confirmation: Joi.string().min(4).valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation')
};

const ResetSchema = {
  email: Joi.string().required().email().label('Email')
};

const ResetPasswordSchema = {
  token: Joi.string().required().label('Token'),
  password: Joi.string().required().label('Password'),
  confirmation: Joi.any().valid(Joi.ref('password')).required().label('Password confirmation')
    .options({ language: { any: { allowOnly: 'must match password' } } })
};

const VerifySchema = {
  token: Joi.string().required()
};

const SignalSchema = {
  ticker: Joi.string().required().label('Ticker'),
  price: Joi.number().required().label('Price'),
  commentsAllowed: Joi.boolean().required().label('Comments allowed'),
  paid: Joi.boolean().required().label('Paid')
};

const CommentSchema = {
  text: Joi.string().required().label('Comment'),
  postId: Joi.string().optional().label('Post'),
  signalId: Joi.string().optional().label('signal')
};

module.exports = {
  validate: validate,
  LoginSchema,
  RegisterSchema,
  ResetSchema,
  ResetPasswordSchema,
  VerifySchema,
  SignalSchema,
  CommentSchema
};

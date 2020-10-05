const Joi = require('joi');

const validate = (schema, source) => {
  return function (req, res, next) {
    if (!source) source = (request, response) => { return request.body; };

    Joi.validate(source(req, res), schema, { abortEarly: true }, function (err, validationResult) {
      if (err) {
        const details = err.details.map(detail => {
          return detail.message;
        });

        return res.boom.badRequest(details, { success: false });
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
  confirmation: Joi.string().min(4).valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation'),
  tos: Joi.boolean().required().valid('Y').options({ language: { any: { allowOnly: 'must be accepted' } } }).label('Terms of Service')
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

module.exports = {
  validate: validate,
  LoginSchema,
  RegisterSchema,
  ResetSchema,
  ResetPasswordSchema,
  VerifySchema
};

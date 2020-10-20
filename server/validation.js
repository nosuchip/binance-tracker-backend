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

const optionalFields = {
  id: Joi.number().optional().label('ID'),
  createdAt: Joi.any().optional(),
  updatedAt: Joi.any().optional()
};

const EntryPointSchema = {
  price: Joi.number().required().label('Price'),
  comment: Joi.string().optional().allow('').label('Entrry point comment'),
  signalId: Joi.number().required().label('Signal ID'),

  ...optionalFields
};

const CommentSchema = {
  text: Joi.string().required().label('Comment'),
  postId: Joi.number().optional().label('Post'),
  signalId: Joi.number().optional().label('Signal'),
  userId: Joi.number().optional().label('User'),

  ...optionalFields
};

const OrderSchema = {
  price: Joi.number().required().label('Price'),
  volume: Joi.number().required().label('Volume'),
  comment: Joi.string().optional().allow('').label('Order comment'),
  type: Joi.string().optional().label('Type'),
  signalId: Joi.number().required().label('Signal'),
  closed: Joi.boolean().optional().label('Closed'),
  closedVolume: Joi.number().optional().label('Closed Volume').allow(null),

  ...optionalFields
};

const SignalSchema = {
  id: Joi.number().optional().label('ID'),
  status: Joi.string().optional().label('Status'),

  ticker: Joi.string().required().label('Ticker'),
  title: Joi.string().required().label('Title'),
  price: Joi.number().optional().label('Price'),
  commentable: Joi.boolean().required().label('Comments allowed'),
  paid: Joi.boolean().required().label('Paid'),
  exitPrice: Joi.number().optional().label('Exit price'),
  profitability: Joi.number().optional().label('Profitability'),
  type: Joi.string().optional().label('Type'),
  risk: Joi.string().optional().label('Risk'),
  term: Joi.string().optional().label('Term'),
  volume: Joi.number().optional().label('Volume'),

  date: Joi.date().optional('Date'),
  post: Joi.string().allow('', null).optional('Post'),

  entryPoints: Joi.array().items(EntryPointSchema),
  takeProfitOrders: Joi.array().items(OrderSchema),
  stopLossOrders: Joi.array().items(OrderSchema),
  comments: Joi.array().optional().items(CommentSchema).label('Signal comments'),

  channel: Joi.string().optional().allow('')
};

const BulkSignalSchema = {
  signals: Joi.array().items(SignalSchema)
};

module.exports = {
  validate: validate,
  LoginSchema,
  RegisterSchema,
  ResetSchema,
  ResetPasswordSchema,
  VerifySchema,
  SignalSchema,
  BulkSignalSchema,
  CommentSchema
};

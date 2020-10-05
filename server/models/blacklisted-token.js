const Mongoose = require('mongoose');

const OutdatedTimeout = 1 * 30 * 24 * 60 * 60 * 1000; // 1 month

const BlacklistedTokenSchema = new Mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now }
});

BlacklistedTokenSchema.statics.invalidate = async token => {
  const model = new BlacklistedToken({ token });
  return model.save();
};

BlacklistedTokenSchema.statics.clean = async token => {
  const monthAgo = new Date(new Date().getTime - OutdatedTimeout);

  return BlacklistedToken.deleteMany({ createdAt: { $lte: monthAgo } });
};

const BlacklistedToken = Mongoose.model('BlacklistedToken', BlacklistedTokenSchema, 'blacklisted_tokens');

module.exports = BlacklistedToken;

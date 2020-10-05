const crypto = require('crypto');
const { promisify } = require('util');

const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha256';

const hashPassword = async (password, salt) => {
  salt = salt || crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
  const hash = await promisify(crypto.pbkdf2)(password, salt, Iterations, PasswordLength, Digest);

  return [salt, Iterations.toString(), hash.toString('hex')].join('.');
};

const checkPassword = async (hashed, password) => {
  try {
    const [salt, iterations, hash] = hashed.split('.');

    if (!iterations || !hash) {
      throw new Error('Hashed value not a password');
    }

    const checkHashed = await hashPassword(password, salt);

    if (checkHashed !== hashed) {
      throw new Error('Password incorrect');
    }
  } catch (error) {
    throw new Error('Password mismatch');
  }
};

module.exports = {
  hashPassword,
  checkPassword
};

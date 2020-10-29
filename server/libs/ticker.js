const safeTicker = (ticker) => ticker.replace(/[^A-Z]/g, '');

module.exports = {
  safeTicker
};

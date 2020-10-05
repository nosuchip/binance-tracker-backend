const isPaid = (user) => user && ['admin', 'paidUser'].includes(user.role);

module.exports = {
  isPaid
};

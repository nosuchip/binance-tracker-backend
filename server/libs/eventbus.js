const { EventEmitter } = require('events');

const EVENT_RELOAD_SIGNALS = 'EVENT_RELOAD_SIGNALS';
const EVENT_REGRESSION_DATA = 'EVENT_REGRESSION_DATA';

const eventbus = new EventEmitter();

module.exports = {
  eventbus,

  EVENT_RELOAD_SIGNALS,
  EVENT_REGRESSION_DATA
};

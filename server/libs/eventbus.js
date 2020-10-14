const { EventEmitter } = require('events');

const EVENT_RELOAD_SIGNALS = 'EVENT_RELOAD_SIGNALS';

const eventbus = new EventEmitter();

module.exports = {
  eventbus,

  EVENT_RELOAD_SIGNALS
};

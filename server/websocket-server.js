const { EventEmitter } = require('events');
const WebSocket = require('ws');
const uuid = require('uuid');
const logger = require('./logger');

class WebsocketServer extends EventEmitter {
  constructor () {
    super();

    this.socket = null;
    this.clients = {};
    this.pingpong = {};
  }

  now () {
    return new Date().getTime();
  }

  getClients (clients) {
    return clients
      .map(client => typeof client === 'string' ? this.clients[client] : client)
      .filter(client => !!client);
  }

  deserialize (message) {
    try {
      const { event, payload } = JSON.parse(message);

      if (!event) {
        throw new Error('Message doesn\'t contains "event" field');
      }

      return { event, payload };
    } catch (error) {
      logger.warn(`Unable to decode message ${message}: ${error.toString()}`);
    }

    return {};
  }

  serialize (event, payload) {
    return JSON.stringify({ event, payload });
  }

  init (httpServer) {
    this.socket = new WebSocket.Server({ server: httpServer });
    this.socket.on('connection', (ws, req) => {
      ws.clientId = uuid.v4();
      this.clients[ws.clientId] = ws;

      ws.send(this.serialize('connected', { id: ws.clientId }));

      this.setupPing(ws);

      ws.on('close', (code, reason) => this.onClose(ws, code, reason));
      ws.on('pong', (data) => this.onPong(ws, data));

      ws.on('message', (message) => {
        const { event, payload } = this.deserialize(message);

        if (event) {
          this.onMessage(event, payload, ws);
        }
      });
    });
  }

  setupPing (ws) {
    var interval = setInterval(() => {
      if (this.pingpong[ws.clientId]) {
        logger.debug(`Client ${ws.clientId} doesn't respond to PING in specified timeout, closing connection`);
        this.onClose(ws, -1, 'Unresponsing to PING');
        return;
      }

      logger.silly(`PING to ${ws.clientId}`);
      this.pingpong[ws.clientId] = this.now();
      ws.ping('PING');
    }, 5000);

    ws.stopPing = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }

  onPong (ws, data) {
    const timeout = this.now() - this.pingpong[ws.clientId];
    logger.silly(`PONG from ${ws.clientId} after ${timeout}ms with data ${data}`);
    this.pingpong[ws.clientId] = null;
  }

  onClose (ws, code, reason) {
    logger.warn(`WS client ${ws.clientId} disconnected, code: ${code}, reason: ${reason}`);
    ws.close();
    ws.stopPing();
    delete this.clients[ws.clientId];
  }

  onMessage (event, payload, ws) {
    this.emit(event, payload, ws, this);
  }

  send (event, data, client) {
    [client] = this.getClients([client]);

    if (client) {
      client.send(this.serialize(event, data));
    }
  }

  async broadcast (event, data, clients) {
    clients = this.getClients(clients || Object.values(this.clients));

    clients.forEach(ws => {
      ws.send(this.serialize(event, data));
    });
  }
}

module.exports = new WebsocketServer();

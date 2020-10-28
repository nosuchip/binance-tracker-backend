/**
 * Regression WS client aimed to send regression data to special websocket on server
 *
 * Usage: node binance-stub-ws/ws-regression-client.js WS_URL CSV_FILE
 * Example: `node binance-stub-ws/ws-regression-client.js ws://localhost:9999/ws ../../stuff/ADA-BNB.csv`
 */

const WebSocket = require('ws');
const csv = require('csv-parser');
const fs = require('fs');

const timeout = async (t = 200) => {
  return new Promise(resolve => setTimeout(() => resolve(), t));
};

const loadData = async () => {
  const [_1, _2, _3, csvFile] = process.argv;

  if (!csvFile) {
    return;
  }

  return new Promise((resolve, reject) => {
    const results = [];

    console.log(`Loading CSV data file ${csvFile}`);

    fs.createReadStream(csvFile)
      .pipe(csv({
        headers: ['ticker', 'price', 'date', 'comment'],
        skipLines: 1
      }))
      .on('data', (data) => {
        if (!data.ticker.startsWith('-')) {
          // results.push(Object.values(data));
          results.push(data);
        }
      })
      .on('error', reject)
      .on('end', () => {
        return resolve(results);
      });
  });
};

const iterateData = async (rows, ws) => {
  for (const { ticker, price, date, comment } of rows) {
    console.log(`Sending regression ticker ${ticker} @ ${price} as of ${date} ${comment ? `(expecting trigger: ${comment})` : ''}`);

    ws.send(JSON.stringify({
      ticker,
      price: price.toString(),
      date: Math.round(new Date(date).getTime() / 1000)
    }));

    await timeout();
  }
};

const run = async () => {
  const regressionWebsocketUrl = process.argv[2];

  if (!regressionWebsocketUrl) {
    throw new Error('Websocket URL must be provided');
  }

  const socket = new WebSocket(regressionWebsocketUrl);

  console.log(`Connecting to regression WS endpoint: ${regressionWebsocketUrl}`);

  const rows = await loadData();

  socket.on('open', async () => {
    console.log('Regression socker connected, begin data transfer to socket');

    iterateData(rows, socket);
  });
};

run();

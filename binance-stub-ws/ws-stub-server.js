const WebSocket = require('ws');
const _ = require('lodash');
const csv = require('csv-parser');
const fs = require('fs');

const PORT = process.env.STUB_PORT || 9999;

const USE_KEYPRESS = false;
const USE_TIMEOUT = 500;

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise(resolve => process.stdin.once('data', data => {
    const byteArray = [...data];
    if (byteArray.length > 0 && byteArray[0] === 3) {
      console.log('^C');
      process.exit(1);
    }
    process.stdin.setRawMode(false);
    resolve();
  }));
};

const timeout = async (t) => {
  return new Promise(resolve => setTimeout(() => resolve(), t));
};

const pause = async (message) => {
  console.log(message);

  if (USE_KEYPRESS) return keypress();
  if (USE_TIMEOUT) return timeout(USE_TIMEOUT);

  return null;
};

const timestamp = () => Math.round(new Date().getTime() / 1000);

var data = [];

const parseArgs = async () => {
  const csvFiles = process.argv.slice(2, process.argv.length);

  if (!csvFiles.length) {
    return;
  }

  const promises = csvFiles.map(csvFile => new Promise((resolve, reject) => {
    const results = [];

    console.log(`Loading CSV data file ${csvFile}`);

    fs.createReadStream(csvFile)
      .pipe(csv({
        headers: ['ticker', 'price', 'comment'],
        skipLines: 1
      }))
      .on('data', (data) => {
        if (!data.ticker.startsWith('-')) {
          results.push(Object.values(data));
        }
      })
      .on('error', reject)
      .on('end', () => {
        return resolve(results);
      });
  }));

  const results = await Promise.all(promises);

  results.forEach(res => data.push(...res));
  _.shuffle(data);
};

const run = async () => {
  await parseArgs();

  const socket = new WebSocket.Server({
    port: PORT
  });

  console.log(`WS server listens on port ${PORT}`);

  socket.on('connection', async (ws, req) => {
    // ws.on('close', (code, reason) => onClose(ws, code, reason));
    // ws.on('pong', (data) => onPong(ws, data));

    console.log('Client connected, ready to send data');

    for (let i = 0; i < data.length; i++) {
      const [ticker, price, comment] = data[i];
      await pause(`Press any key to send data [${ticker}, ${price}] to the client. ${comment ? 'Expected trigger:' + comment : ''}`);

      const event = {
        e: 'trade',
        E: timestamp(),
        s: ticker.replace(/[^A-Z]/g, ''),
        t: timestamp(),
        p: price.toString(),
        q: '1',
        b: (1000 + i).toString(),
        a: (2000 + i).toString(),
        T: timestamp(),
        m: true,
        M: true
      };

      ws.send(JSON.stringify(event));
    }

    console.log('All data sent');
  });
};

run();

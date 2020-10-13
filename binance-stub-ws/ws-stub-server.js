const WebSocket = require('ws');
const csv = require('csv-parser');
const fs = require('fs');

const PORT = process.env.STUB_PORT || 9999;

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

const timestamp = () => Math.round(new Date().getTime() / 1000);

var data = [
  ['EOS/BTC', 0.0002632, ''],
  ['EOS/BTC', 0.0002603, ''],
  ['EOS/BTC', 0.0002644, 'Вход 2'],
  ['EOS/BTC', 0.0002995, ''],
  ['EOS/BTC', 0.0003022, ''],
  ['EOS/BTC', 0.0002968, ''],
  ['EOS/BTC', 0.0002678, ''],
  ['EOS/BTC', 0.0003036, ''],
  ['EOS/BTC', 0.000306, ' TP1'],
  ['EOS/BTC', 0.0002902, ''],
  ['EOS/BTC', 0.0003022, ''],
  ['EOS/BTC', 0.0003082, ''],
  ['EOS/BTC', 0.000246, ''],
  ['EOS/BTC', 0.0002946, ''],
  ['EOS/BTC', 0.000236, 'SL1'],
  ['EOS/BTC', 0.0002538, ''],
  ['EOS/BTC', 0.0002853, ''],
  ['EOS/BTC', 0.0002421, ''],
  ['EOS/BTC', 0.0002433, ''],
  ['EOS/BTC', 0.0002242, ''],
  ['EOS/BTC', 0.0002404, ''],
  ['EOS/BTC', 0.000224, ''],
  ['EOS/BTC', 0.0002818, ''],
  ['EOS/BTC', 0.0002441, ''],
  ['EOS/BTC', 0.0002353, ''],
  ['EOS/BTC', 0.0002692, ''],
  ['EOS/BTC', 0.0002743, ''],
  ['EOS/BTC', 0.0002544, ''],
  ['EOS/BTC', 0.0003127, ''],
  ['EOS/BTC', 0.0003022, ''],
  ['EOS/BTC', 0.0003199, 'TP2']
];

const parseArgs = async () => {
  const csvFile = process.argv[2];

  if (!csvFile) {
    return;
  }

  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv({
        headers: ['ticker', 'price', 'comment'],
        skipLines: 1
      }))
      .on('data', (data) => results.push(Object.values(data)))
      .on('error', reject)
      .on('end', () => {
        data = results;
        return resolve(results);
      });
  });
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
      console.log(`Press any key to send data [${ticker}, ${price}] to the client. ${comment ? 'Expected trigger:' + comment : ''}`);

      await keypress();

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

const config = require('@base/config');
const https = require('https');

const sendRequest = () => {
  var options = {
    hostname: 'binance-tracker-dev.herokuapp.com',
    port: 443,
    path: '/api',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.on('data', (data) => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

const wakeUp = () => {
  setTimeout(async () => {
    try {
      const { body, status } = await sendRequest();
      console.log(`App responded with code ${status} and body ${body}`);
    } catch (error) {
      console.error('Unable to send request', error);
    } finally {
      wakeUp();
    }
  }, config.wakeUpTimeoutMs);
};

module.exports = {
  wakeUp
};

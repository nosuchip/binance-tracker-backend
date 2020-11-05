const config = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !!process.env.DEBUG,

  logLevel: process.env.LOG_LEVEL || 'info', // 'error', 'warn', 'info', 'verbose', 'debug', 'silly'

  storeHistory: !!process.env.STORE_HISTORY,

  binanceUri: process.env.BINANCE_WS_URI,

  databaseUri: process.env.MYSQL_URI,
  databaseOpts: {
    dialect: 'mysql',
    logging: false,
    dialectOptions: { decimalNumbers: true },
    pool: {
      max: 5,
      min: 2,
      idle: 10000
    }
  },

  appKey: process.env.APP_KEY,

  port: process.env.PORT || 3000,
  regressionWsPort: process.env.REGRESSION_WS_PORT,

  siteUrl: 'http://frontend.herokuapp.com/',

  cors: {
    whitelist: (process.env.CORS || '').split(' ').map(host => { return new RegExp(host); }),

    credentials: true,

    origin: function (origin, callback) {
      if (typeof origin === 'undefined') return callback(null, true);

      for (let i = 0; i < config.cors.whitelist.length; i++) {
        const element = config.cors.whitelist[i];
        if (element.test(origin)) return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS: "${origin}" not in "${config.cors.whitelist}"`));
    },
    optionsSuccessStatus: 200
  },

  jwtOptions: {
    expiresIn: '7d'
  },

  bearerOptions: {
    bodyKey: 'access_token',
    queryKey: 'access_token',
    headerKey: 'Bearer',
    reqKey: 'token'
  },

  rateLimitOptions: {
    // 1 minute
    windowMs: 1 * 60 * 1000,

    // 3- requests per windowMs
    max: 30,

    // disable delaying - full speed until the max limit is reached
    delayMs: 0
  },

  updateSparklines: !!process.env.UPDATE_SPARKLINES,

  wakeUpTimeoutMs: parseInt(process.env.WAKE_UP_TIMEOUT_MS) || 10 * 60 * 1000
};

console.log('Using config:');
console.log(JSON.stringify(config, null, 2));

module.exports = config;

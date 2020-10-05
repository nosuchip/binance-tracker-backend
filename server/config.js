const path = require('path');

const config = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !!process.env.DEBUG,

  logLevel: process.env.LOG_LEVEL || 'info', // 'error', 'warn', 'info', 'verbose', 'debug', 'silly'

  databaseUri: process.env.MONGODB_URI,

  appKey: process.env.APP_KEY,

  port: process.env.PORT || 3000,

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

  cache: {
    urlCacheOptions: {
      stdTTL: 60,
      checkperiod: 70,
      deleteOnExpire: true
    },

    proxyCacheOptions: {
      stdTTL: 600 // 10 minutes
    }
  },

  mailerConfig: {
    auth: {
      api_user: process.env.SENDGRID_USERNAME || undefined,
      api_key: process.env.SENDGRID_PASSWORD
    },
    from: 'info@domain.com',
    rendererConfig: {
      viewPath: path.join(__dirname, 'templates/emails/'),
      extName: '.handlebars'
    }
  }
};

module.exports = config;

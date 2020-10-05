# express backend boilerplate

Heroku-ready API server with users management endpoints.

Uses:
- aliased modules for development
- `Winston` for logging (to mongo collection on production)
- `CORS` request limitation
- Request rate limit
- Async ExpressJS error handling
- `Bearer token` with JWT for authentication and authorization
- `express-boom` for error responses
- Mongoose + GridFS
- Joi for input validation (not `express-joi`)
- Cache
- Node mailer with SendGrid binding and Handlebars templates
- Websocket support

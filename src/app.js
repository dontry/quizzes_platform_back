const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const configuration = require('feathers-configuration');
const feathers = require('feathers');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const authentication = require('./authentication');

module.exports = (function() {
  const app = feathers();

  // Load app configuration
  app.configure(configuration());
  // Enable CORS, security, compression, favicon and body parsing
  app.use(cors());
  app.use(helmet());
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
  // Host the public folder
  app.use('/', feathers.static(app.get('public')));

  // Set up Plugins and providers
  app.configure(hooks());
  app.configure(rest());
  app.configure(socketio());

  // Configure other middleware (see `middleware/index.js`)a
  app.configure(middleware);
  app.configure(authentication);
  // Set up Database
  app.configure(services);
  // Configure a middleware for 404s and the error handler
  app.use(notFound());
  app.use(handler());

  app.hooks(appHooks);
  return app;
})();


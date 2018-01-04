/* eslint-disable no-console */
process.env.NODE_ENV = 'test';
const logger = require('winston');
const app = require('../../src/app');
const server = app.listen(8686);
const createDbTest = require('../integration/seed');

const db = createDbTest(app);
Promise.resolve(db.createAll()).then(() => {
  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
  );

  server.on('listening', () =>
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
  );

});

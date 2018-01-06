/* eslint-disable no-console */
process.env.NODE_ENV = 'test';
const logger = require('winston');
const app = require('../src/app');
const server = app.listen(8686);
const createDbTest = require('../test/fixture/seed');



console.log('=====================RUN SERVER ON 8686=====================');
const db = createDbTest(app);
app.get('sequelize').sync()
  .then(() => {
    db.createAll('MOCK')
  })
  .then(() => {
    process.on('unhandledRejection', (reason, p) =>
      logger.error('Unhandled Rejection at: Promise ', p, reason)
    )
  });



server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), 8686)
);

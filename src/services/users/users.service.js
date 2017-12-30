const createService = require('feathers-sequelize');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);

  app
    .use('/users', createService({
      Model
    }))
    .use(errorHandler());

  const service = app.service('users');
  service.hooks(hooks);
};

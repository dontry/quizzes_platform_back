const createService = require('feathers-sequelize');
const createModel = require('../../models/answers.model');
const hooks = require('./answers.hook');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);

  app
    .use('/answers', createService({
      Model
    }))
    .use(errorHandler());

  const service = app.service('answers');
  service.hooks(hooks);
};

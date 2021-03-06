const createService = require('feathers-sequelize');
const createModel = require('../../models/quizzes.model');
const hooks = require('./quizzes.hooks');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  // const paginate = app.get('paginate');
  // const id = app.get('id');
  // const events = app.get('events');
  // const options = {
  //   Model,
  //   paginate: {
  //     default: 2,
  //     max: 4
  //   }
  // };
  app
    .use('/quizzes', createService({
      Model
    }))
    .use(errorHandler());

  const service = app.service('quizzes');
  service.hooks(hooks);
};

const createService = require('feathers-sequelize');
const createModel = require('../../models/questions.model');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);

  app
    .use('/questions', createService({
      Model
    }))
    .use(errorHandler());


};

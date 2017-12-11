const createService = require('feathers-sequelize');
const createModel = require('../../models/quizzes.model');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  // const paginate = app.get('paginate');
  // const id = app.get('id');
  // const events = app.get('events');

  const options = {
    Model,
    paginate: {
      default: 2,
      max: 4
    }
  };
  app
    .use('/quizzes', createService(options))
    .use(errorHandler());

  // Model.sync({
  //   force: true
  // }).then(() => {
  //   if(app.service('quizzes').find()) return;
    
  //   //Create a dummy Message
  //   app.service('quizzes').create({
  //     title: 'First Quiz',
  //     author: 'dong cai',
  //   }).then(quiz => {
  //     console.log('Quiz Created: ', JSON.stringify(quiz));
  //   });
  // });
};

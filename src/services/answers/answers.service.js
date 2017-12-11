const createService = require('feathers-sequelize');
const createModel = require('../../models/answers.model');
const errorHandler = require('feathers-errors/handler');

module.exports = function () {
  const app = this;
  const Model = createModel(app);

  app
    .use('/answers', createService({
      Model
    }))
    .use(errorHandler());

//   Model.sync({
//     force: true
//   }).then(() => {
//     if (app.service('answers').find()) return;

//     app.service('answers').create({
//       content: '1'
//     }).then(answer => {
//       console.log('Answer Created: ', JSON.stringify(answer));
//     });
//   });
};

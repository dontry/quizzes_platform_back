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

//   Model.sync({
//     force: true
//   }).then(() => {
//     if (app.service('questions').find()) return;

//     app.service('questions').create({
//       title: 'How are you?',
//       type: 'single',
//       options: {
//         data: ['Very good.', 'good', 'average', 'bad']
//       },
//       quizId: 1
//     }).then(question => {
//       console.log('Question Created: ', JSON.stringify(question));
//     });

//     app.service('questions').create({
//       title: 'How old are you',
//       type: 'number',
//       quizId: 1
//     }).then(question => {
//       console.log('Question Created: ', JSON.stringify(question));
//     });

//     app.service('questions').create({
//       title: 'What is your name?',
//       type: 'text',
//       quizId: 1
//     }).then(question => {
//       console.log('Question Created: ', JSON.stringify(question));
//     });
//   });
};

const quizzes = require('./quizzes/quizzes.service');
const questions = require('./questions/questions.service');
const answers = require('./answers/answers.service');
const initSequelize = require('../config/db');

module.exports = async function () {
  const app = this; // eslint-disable-line no-unused-vars
  const sequelize = initSequelize(app);
  app.set('sequelize', sequelize);

  app.configure(quizzes);
  app.configure(questions);
  app.configure(answers);

  app.set('models', sequelize.models);
  const models = app.get('models');

  Object.keys(sequelize.models).forEach(modelName => {
    if ('associate' in sequelize.models[modelName]) {
      sequelize.models[modelName].associate(models);
    }
  });

  models['quiz'].sync({
    force: true
  }).then(async() => {
    const quizzes = await app.service('quizzes').find();
    if (quizzes.length > 0) return;

    //Create a dummy Message
    app.service('quizzes').create({
      title: 'Second Quiz',
      author: 'dong cai',
    });
  }).then(() => {
    models['question'].sync({
      force: true
    }).then(async () => {
      const questions = await app.service('questions').find();
      if (questions.length > 0) return;
  
      await app.service('questions').create({
        title: 'How are you?',
        type: 'single',
        options: {
          data: ['Very good.', 'good', 'average', 'bad']
        },
        quizId: 1
      }).then(question => {
        console.log('Question Created: ', JSON.stringify(question));
      });
  
      await app.service('questions').create({
        title: 'How old are you',
        type: 'number',
        quizId: 1
      }).then(question => {
        console.log('Question Created: ', JSON.stringify(question));
      });
  
      await app.service('questions').create({
        title: 'What is your name?',
        type: 'text',
        quizId: 1
      }).then(question => {
        console.log('Question Created: ', JSON.stringify(question));
      });
    });
  }).then(() => {
    models['answer'].sync({
      force: true
    }).then(async () => {
      const answers = await app.service('answers').find();
      if(answers.length > 0) return;
      
      await app.service('answers').create({
        content: '1',
        type: 'single',
        questionId: '1'
      }).then(answer => {
        console.log('Answer Created: ', JSON.stringify(answer));
      });
      
      await app.service('answers').create({
        content: '23',
        type: 'number',
        questionId: '2'
      }).then(answer => {
        console.log('Answer Created: ', JSON.stringify(answer));
      })
    });
  });

  sequelize.sync();
};

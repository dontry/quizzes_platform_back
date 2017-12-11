const quizzes = require('./quizzes/quizzes.service');
const questions = require('./questions/questions.service');
const answers = require('./answers/answers.service');
const initSequelize = require('../config/db');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  const sequelize = initSequelize(app);
  app.set('sequelize', sequelize);

  app.configure(quizzes);
  app.configure(questions);
  app.configure(answers);
  
  app.set('models', sequelize.models);

  Object.keys(sequelize.models).forEach( modelName => {
    if('associate' in sequelize.models[modelName]) {
      const models = app.get('models');
      sequelize.models[modelName].associate(models);
    }
  });
  
  sequelize.sync();
};

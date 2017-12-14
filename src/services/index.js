const quizzes = require('./quizzes/quizzes.service');
const questions = require('./questions/questions.service');
const answers = require('./answers/answers.service');
const initSequelize = require('../config/db');
const initSequelizeTest= require('../config/db.test');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  let sequelize;
  if(process.env.NODE_ENV === 'test') {
    sequelize = initSequelizeTest(app);
  } else {
    sequelize = initSequelize(app);
  }
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

  sequelize.sync();
};

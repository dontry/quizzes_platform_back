const Sequelize = require('sequelize');

const config = {
  host: 'localhost',
  dialect: 'mysql',
};

module.exports = function (app) {
  if (!app.sequelize) {
    return new Sequelize('quizzes_platform', 'root', 'mysql', config);
  }
};

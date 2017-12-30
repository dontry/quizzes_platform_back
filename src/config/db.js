const Sequelize = require('sequelize');

const config = {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false
};

module.exports = function (app) {
  if (!app.sequelize) {
    return new Sequelize('quizzes_platform', 'root', '', config);
  }
};

const Sequelize = require('sequelize');

const config = {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  logging: true
};

module.exports = function (app) {
  if (!app.sequelize) {
    return new Sequelize('quizzes_platform_test', 'root', '', config);
  }
};

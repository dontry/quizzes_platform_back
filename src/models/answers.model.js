const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('answer', {
    content: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  return Model;
};

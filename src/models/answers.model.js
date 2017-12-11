const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('answer', {
    content: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('SINGLE', 'MULTIPLE', 'TEXT', 'NUMBER'),
      allowNull: false,
      defaultValue: 'SINGLE',
      set(val) {
        this.setDataValue('type', val.toUpperCase());
      }
    }
  });

  return Model;
};

const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('Question', {
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('SINGLE', 'MULTIPLE', 'TEXT', 'NUMBER'),
      allowNull: false,
      defaultValue: 'SINGLE',
      set(val) {
        this.setDataValue('type', val.toUpperCase());
      }
    },
    options: Sequelize.STRING,
  }, {
    freezeTableName: true
  });

  Model.associate = (models) => {
    models.Question.hasMany(models.Answer, {
      foreignKey: 'quesitonId',
      as: 'answers'
    });

    models.Question.belongsTo(models.Quiz, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'quizId',
        allowNull: false
      }
    });
  };

  return Model;
};

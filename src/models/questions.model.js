const Sequelize = require('sequelize');
const QUESTION_TYPE = {
  MULTIPLE: 'MULIPLE',
  TEXT: 'TEXT',
  CHECKBOX: 'CHECKBOX',
  NUMBER: 'NUMBER',
  SCALE: 'SCALE'
};

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('Question', {
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('CHECKBOX', 'MULTIPLE', 'NUMBER', 'TEXT', 'SCALE'),
      allowNull: false,
      defaultValue: 'MULTIPLE',
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
      foreignKey: 'questionId',
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

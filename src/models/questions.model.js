const Sequelize = require('sequelize');

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
      as: 'answers',
      onDelete: 'CASCADE'
    });

    models.Question.belongsTo(models.Quiz, {
      foreignKeyConstraint: true,
      foreignKey: {
        name: 'quizId',
        allowNull: false
      }
    });
  };

  return Model;
};

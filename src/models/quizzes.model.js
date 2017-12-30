const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('Quiz', {
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('UNPUBLISHED', 'PUBLISHED', 'FINISHED'),
      allowNull: false,
      defaultValue: 'UNPUBLISHED',
      set(val) {
        this.setDataValue('status', val.toUpperCase());
      }
    },
    start_date: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    end_date: Sequelize.DATE
  }, {
    freezeTableName: true,
  });

  Model.associate = (models) => {
    models.Quiz.hasMany(models.Question, {
      foreignKey: 'quizId',
      as: 'questions'
    });

    models.Quiz.belongsTo(models.User, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'author',
        allowNull: false
      }
    });
  };

  return Model;
};

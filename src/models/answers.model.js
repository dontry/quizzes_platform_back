const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('Answer', {
    content: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  Model.associate = (models) => {
    models.Answer.belongsTo(models.Question, {
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'questionId',
        allowNull: false
      }
    });
  };
  return Model;
};

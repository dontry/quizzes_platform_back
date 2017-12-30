const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('User', {
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstname: {
      type: Sequelize.STRING
    },
    lastname: {
      type: Sequelize.STRING
    },
    gender: {
      type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER')
    }
  }, {
    freezeTableName: true
  });

  Model.associate = (models) => {
    models.User.hasMany(models.Quiz, {
      foreignKey: 'author',
      as: 'quizzes'
    });
  };

  return Model;
};

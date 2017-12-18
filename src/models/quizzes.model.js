const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('quiz', {
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    author: Sequelize.STRING,
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
    models['quiz'].hasMany(models['question'], {
      onDelete: 'cascade',
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Model;
};

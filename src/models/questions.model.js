const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelize = app.get('sequelize');

  const Model = sequelize.define('question', {
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
    models['question'].hasMany(models['answer'], {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Model;
};

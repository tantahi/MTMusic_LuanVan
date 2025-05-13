const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Play extends Model {}

Play.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  media_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'medias',
      key: 'id',
    },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Play',
  tableName: 'plays',
  timestamps: false,
});

module.exports = Play;

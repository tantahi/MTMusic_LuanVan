const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class UserFollow extends Model {}

UserFollow.init({
  follower_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  following_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'UserFollow',
  tableName: 'user_follows',
  timestamps: false,
});

module.exports = UserFollow;

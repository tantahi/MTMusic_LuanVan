const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Like extends Model {}

Like.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      likeable_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      likeable_type: {
        type: DataTypes.ENUM('Media', 'Playlist'),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
}, {
  sequelize,
  modelName: 'Like',
  tableName: 'likes',
  timestamps: false,
});

module.exports = Like;

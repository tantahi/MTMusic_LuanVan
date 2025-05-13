const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Playlist extends Model {}

Playlist.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  genre: {
    type: DataTypes.ENUM('Pop', 'Rap', 'Jazz', 'Classical'),
  },
  artist_name: {
    type: DataTypes.STRING,
  },
  img_url: {
    type: DataTypes.STRING,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Playlist', 'Album', 'Favourite'),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Allow null for free albums
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Playlist',
  tableName: 'playlists',
  timestamps: true, // Enable automatic timestamps (createdAt and updatedAt)
  createdAt: 'created_at', // Alias createdAt to created_at
  updatedAt: 'updated_at', // Alias updatedAt to updated_at
  paranoid: true, // Use deleted_at
});

module.exports = Playlist;
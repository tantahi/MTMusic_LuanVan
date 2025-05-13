const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class PlaylistItem extends Model {}

PlaylistItem.init({
  playlist_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'playlists',
      key: 'id',
    },
    allowNull: false,
  },
  index: { type: DataTypes.INTEGER },
  media_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'medias',
      key: 'id',
    },
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'PlaylistItem',
  tableName: 'playlist_items',
  timestamps: false,
});

module.exports = PlaylistItem;
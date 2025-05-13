const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Media extends Model {}

Media.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  artist_name: {
    type: DataTypes.STRING,
  },
  img_url: {
    type: DataTypes.STRING,
  },
  audio_url: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.TEXT,
  },
  description: {
    type: DataTypes.TEXT,
  },
  lyric: {
    type: DataTypes.TEXT,
  },
  media_type: {
    type: DataTypes.ENUM('Song', 'Podcast'),
    allowNull: false,
  },
  genre: {
    type: DataTypes.ENUM('Pop', 'Rap', 'Jazz', 'Classical'),
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reports_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  audio_vector: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Allow null for free albums
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  deletedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if not approved yet
    references: {
      model: 'users',
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Rejected', 'Approved', 'Reported'),
    allowNull: false,
    defaultValue: 'Pending', // Default status is 'Pending'
  },

}, {
  sequelize,
  modelName: 'Media',
  tableName: 'medias',
  timestamps: true, // Enable automatic timestamps (createdAt and updatedAt)
  createdAt: 'created_at', // Alias createdAt to created_at
  updatedAt: 'updated_at', // Alias updatedAt to updated_at
});

module.exports = Media;

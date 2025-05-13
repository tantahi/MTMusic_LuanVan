const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Comment extends Model {}

Comment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cusor: {
    type: DataTypes.INTEGER,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
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
  parent_comment_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'comments',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments',
  timestamps: false,
});

module.exports = Comment;


const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sent_at: {
    type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: false,
});

module.exports = Message;

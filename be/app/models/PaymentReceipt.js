const { sequelize, Model, DataTypes } = require('../../config/dbconfig');
const User = require('./User'); // Assuming User model is in the same folder
const Payment = require('./Payment'); // Assuming User model is in the same folder

class PaymentReceipt extends Model {}

PaymentReceipt.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed'),
    defaultValue: 'Completed',
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Reference to the User model
      key: 'id',
    }
  },
  item_type: {
    type: DataTypes.ENUM('Song', 'Album', 'VIP Subscription', 'Podcast'),
    allowNull: false,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Payment,
      key: 'id',
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'PaymentReceipt',
  tableName: 'payment_receipts',
  timestamps: true, // Enable automatic timestamps (createdAt and updatedAt)
  createdAt: 'created_at', // Alias createdAt to created_at
  updatedAt: 'updated_at', // Alias updatedAt to updated_at
  paranoid: true, // Use deleted_at
});



module.exports = PaymentReceipt;
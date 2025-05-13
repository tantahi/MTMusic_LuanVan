const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  img_url: {
    type: DataTypes.STRING,
        allowNull: true,
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Staff', 'User', 'Vip User'),
    allowNull: false,
  },
  paypalAccountId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "ID tài khoản PayPal liên kết"
},
paypalEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
        isEmail: true
    },
    comment: "Địa chỉ email của PayPal"
},
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Banned'),
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  vip_start_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  vip_end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  report_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true, // Enable automatic timestamps (createdAt and updatedAt)
  createdAt: 'created_at', // Alias createdAt to created_at
  updatedAt: 'updated_at', // Alias updatedAt to updated_at
  paranoid: true, // Use deleted_at
});

module.exports = User;

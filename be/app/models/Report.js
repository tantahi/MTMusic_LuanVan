const { sequelize, Model, DataTypes } = require('../../config/dbconfig');

class Report extends Model {}

Report.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  post_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'medias',
      key: 'id',
    },
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
  report_type: {
    type: DataTypes.ENUM('Spam', 'Inappropriate Content', 'Copyright Violation', 'Other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null if not approved yet
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Rejected', 'Accepted'),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Report',
  tableName: 'reports',
  timestamps: false,
});

module.exports = Report;

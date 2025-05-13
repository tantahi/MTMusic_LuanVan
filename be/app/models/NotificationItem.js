const { sequelize, DataTypes } = require('../../config/dbconfig');

const NotificationItem = sequelize.define('NotificationItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    notification_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'notifications',
            key: 'id',
        },
    },
    related_item_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'medias',
            key: 'id',
        },
    },
    related_item_type: {
        type: DataTypes.ENUM('Media', 'OtherType'),
        allowNull: false,
    },
    action: {
        type: DataTypes.ENUM('Like', 'Report'),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'notification_items',
    timestamps: false,
});

module.exports = NotificationItem;

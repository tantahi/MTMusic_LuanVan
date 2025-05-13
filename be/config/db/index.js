const { sequelize } = require('../dbconfig');

async function connect() {
    try {
        await sequelize.sync();
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!', error);
    }
}

// Import models
const User = require('../../app/models/User');
const Comment = require('../../app/models/Comment');
const Media = require('../../app/models/Media');
const Playlist = require('../../app/models/Playlist');
const PlaylistItem = require('../../app/models/PlaylistItem');
const UserFollow = require('../../app/models/UserFollow');
const Play = require('../../app/models/Play');
const Message = require('../../app/models/Message');
const Like = require('../../app/models/Like');
const Report = require('../../app/models/Report');
const Notification = require('../../app/models/Notification');
const NotificationItem = require('../../app/models/NotificationItem');
const PaymentReceipt = require('../../app/models/PaymentReceipt');
const Payment = require('../../app/models/Payment');

// Define associations

// User associations
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Playlist, { foreignKey: 'user_id' });
Playlist.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });

User.hasMany(Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

User.hasMany(Play, { foreignKey: 'user_id' });
Play.belongsTo(User, { foreignKey: 'user_id' });

User.belongsToMany(User, { as: 'Follower', through: UserFollow, foreignKey: 'follower_id' });
User.belongsToMany(User, { as: 'Following', through: UserFollow, foreignKey: 'following_id' });

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Report, { foreignKey: 'user_id', as: 'Reports' });
Report.belongsTo(User, { foreignKey: 'user_id', as: 'User' });


User.hasMany(Notification, { foreignKey: 'receiver_id' });
Notification.belongsTo(User, { foreignKey: 'receiver_id' });

User.hasMany(Media, { foreignKey: 'createdBy' });
Media.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });

User.hasMany(Media, { foreignKey: 'deletedBy' });
Media.belongsTo(User, { foreignKey: 'deletedBy', as: 'Deleter' });

// User associations with Payment
User.hasMany(Payment, { as: 'requestedPayments', foreignKey: 'requesterId' });
User.hasMany(Payment, { as: 'approvedPayments', foreignKey: 'approverId' });


// Payment associations with User
Payment.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
Payment.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });

Payment.hasMany(PaymentReceipt, { as: 'receipts', foreignKey: 'payment_id' });

// PaymentReceipt association with Payment
PaymentReceipt.belongsTo(Payment, { foreignKey: 'payment_id' });

// PaymentReceipt associations with User
User.hasMany(PaymentReceipt, { foreignKey: 'user_id', as: 'BuyerPayments' });
PaymentReceipt.belongsTo(User, { foreignKey: 'user_id', as: 'Buyer' });

User.hasMany(PaymentReceipt, { foreignKey: 'seller_id', as: 'SellerPayments' });
PaymentReceipt.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });

User.hasMany(PaymentReceipt, { foreignKey: 'approvedBy', as: 'ApprovedPayments' });
PaymentReceipt.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });

// Media associations
Media.hasMany(Comment, { foreignKey: 'media_id' });
Comment.belongsTo(Media, { foreignKey: 'media_id' });

Media.hasMany(Play, { foreignKey: 'media_id' });
Play.belongsTo(Media, { foreignKey: 'media_id' });

Media.hasMany(Like, { foreignKey: 'post_id' });
Like.belongsTo(Media, { foreignKey: 'post_id' });

Media.hasMany(Report, { foreignKey: 'post_id', as: 'Reports' });
Report.belongsTo(Media, { foreignKey: 'post_id', as: 'Media' });

Media.hasMany(Notification, { foreignKey: 'related_item_id' });
Notification.belongsTo(Media, { foreignKey: 'related_item_id' });

Media.hasMany(PaymentReceipt, { foreignKey: 'item_id' });
PaymentReceipt.belongsTo(Media, { foreignKey: 'item_id', constraints: false, as: 'MediaItem' });

// Playlist and PlaylistItem associations
Playlist.hasMany(PlaylistItem, { foreignKey: 'playlist_id' });
PlaylistItem.belongsTo(Playlist, { foreignKey: 'playlist_id' });

PlaylistItem.belongsTo(Media, { foreignKey: 'media_id' });
Media.hasMany(PlaylistItem, { foreignKey: 'media_id' });

Playlist.belongsToMany(Media, { through: PlaylistItem, foreignKey: 'playlist_id' });
Media.belongsToMany(Playlist, { through: PlaylistItem, foreignKey: 'media_id' });

Playlist.hasMany(PaymentReceipt, { foreignKey: 'item_id' });
PaymentReceipt.belongsTo(Playlist, { foreignKey: 'item_id', constraints: false, as: 'PlaylistItem' });

// Comment associations 
Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'ParentComment' });
Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'ChildComments' });

// Notification associations
Notification.hasMany(NotificationItem, { foreignKey: 'notification_id' });
NotificationItem.belongsTo(Notification, { foreignKey: 'notification_id' });

module.exports = { connect };
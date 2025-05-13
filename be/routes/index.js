const authRouter = require ('./auth.route');
const adminRouter = require ('./admin.route');
const mediaRouter = require ('./media.route');
const commentRouter = require ('./comment.route');
const profileRouter = require ('./profile.route');
const chatRoute = require('./chat.route');
const followRoute = require('./following.route');
const notificationRoute = require('./notification.route');
const reportRoute = require('./report.route');
const userRoute = require('./user.route');
const paymentRoute = require('./payment.route');
const dasnhboardRoute = require('./dashboard.route');

function route(app) {
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter)
    app.use('/media', mediaRouter)
    app.use('/comments', commentRouter)
    app.use('/profile', profileRouter)
    app.use('/chat', chatRoute);
    app.use('/following', followRoute);
    app.use('/notification', notificationRoute);
    app.use('/reports', reportRoute);
    app.use('/users', userRoute);
    app.use('/payments', paymentRoute);
    app.use('/api/dashboard', dasnhboardRoute);
}

module.exports = route; 
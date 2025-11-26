const Notification = require('../models/Notification.js');

class NotificationService {

    // 1. Tạo thông báo mới
    async createNotification({ recipient, sender, type, title, content, data }) {
        const newNotification = await Notification.create({
            recipient,
            sender,
            type,
            title,
            content,
            data
        });

        // TODO: Tại đây bạn có thể tích hợp Socket.io để bắn realtime về client ngay lập tức
        // global.io.to(recipient.toString()).emit('new_notification', newNotification);

        return newNotification;
    }

    // 2. Lấy danh sách thông báo của User (có phân trang)
    async getUserNotifications(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name avatar'); // Lấy thêm info người gửi nếu cần

        const total = await Notification.countDocuments({ recipient: userId });
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        return {
            notifications,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            unreadCount
        };
    }

    // 3. Đánh dấu 1 thông báo là đã đọc
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );
        return notification;
    }

    // 4. Đánh dấu TẤT CẢ là đã đọc
    async markAllAsRead(userId) {
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        return { success: true };
    }

    // 5. Xóa thông báo
    async deleteNotification(notificationId, userId) {
        await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
        return { success: true };
    }
}

module.exports = new NotificationService();
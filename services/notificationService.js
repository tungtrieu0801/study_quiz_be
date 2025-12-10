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
    // --- LOGIC CŨ: Thông báo cá nhân (Cái Chuông) ---
    async getUserNotifications(userId, page = 1, limit = 10) {
        // Chỉ lấy các thông báo có recipient là user đó
        // Loại trừ SYSTEM_UPDATE ra (vì nó dành cho Popup, không hiện ở chuông cho đỡ rối)
        const filter = {
            recipient: userId,
            type: { $ne: 'SYSTEM_UPDATE' }
        };

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name avatar');

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

        return { notifications, total, unreadCount };
    }

    // --- LOGIC MỚI: Lấy thông báo Update (Cái Popup) ---
    async getLatestSystemUpdate(userRole) {
        // Tìm bản ghi loại SYSTEM_UPDATE mới nhất
        return await Notification.findOne({
            type: 'SYSTEM_UPDATE',
            isActive: true,
            $or: [{ targetRole: 'all' }, { targetRole: userRole }]
        })
            .sort({ createdAt: -1 }) // Lấy cái mới tạo nhất
            .select('version title features createdAt'); // Chỉ lấy field cần thiết
    }

    // --- ADMIN: Tạo thông báo Update ---
    async createSystemUpdate(data) {
        // Data input ví dụ: { version: '1.5.0', title: '...', features: [...], targetRole: 'teacher' }
        return await Notification.create({
            ...data,
            type: 'SYSTEM_UPDATE',
            recipient: null // Quan trọng: Global không có recipient cụ thể
        });
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
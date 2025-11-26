const notificationService = require('../services/notificationService.js');

class NotificationController {

    // [GET] /api/notifications
    async getMyNotifications(req, res) {
        try {
            // Giả sử bạn có middleware auth gán user vào req.user
            const userId = req.user.id;
            const { page, limit } = req.query;

            const data = await notificationService.getUserNotifications(
                userId,
                parseInt(page) || 1,
                parseInt(limit) || 10
            );

            return res.status(200).json({
                success: true,
                data: data
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // [PATCH] /api/notifications/:id/read
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const updated = await notificationService.markAsRead(id, userId);

            if (!updated) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }

            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // [PATCH] /api/notifications/read-all
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await notificationService.markAllAsRead(userId);
            return res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // [DELETE] /api/notifications/:id
    async deleteNotification(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await notificationService.deleteNotification(id, userId);
            return res.status(200).json({ success: true, message: 'Deleted successfully'});
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new NotificationController();
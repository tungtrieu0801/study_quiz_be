const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.js');

router.get('/latest-update', notificationController.getLatestUpdate);
router.post('/system-update', notificationController.createSystemUpdate);
router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
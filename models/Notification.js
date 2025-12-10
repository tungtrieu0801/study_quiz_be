const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // [SỬA 1] Thêm 'SYSTEM_UPDATE' vào enum
    type: {
        type: String,
        enum: ['SYSTEM', 'EXAM', 'RESULT', 'CHAT', 'REMINDER', 'SYSTEM_UPDATE'],
        default: 'SYSTEM'
    },

    title: { type: String, required: true },

    // [SỬA 2] Bỏ required: true đi (Vì System Update không cần content, nó dùng features)
    content: { type: String, default: '' },

    data: { type: Object, default: {}},
    isRead: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now,
        // Lưu ý: System Update cũng sẽ bị xoá sau 30 ngày nếu giữ dòng này.
        // Nếu muốn giữ lại lịch sử update lâu dài, bạn cần cân nhắc bỏ expires hoặc xử lý riêng.
        expires: 60 * 60 * 24 * 30
    },

    version: { type: String, index: true },

    // [SỬA 3] Đổi tên thành 'features' (số nhiều) để khớp với Code Controller và Postman
    features: [{ title: String, description: String, tag: String }],

    targetRole: {
        type: String,
        enum: ['all', 'teacher', 'student'],
        default: 'all'
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
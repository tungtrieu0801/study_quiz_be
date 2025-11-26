const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Đánh index để query tìm thông báo của user nhanh hơn
    },
    sender: { // Người gửi (có thể null nếu là System gửi)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        enum: ['SYSTEM', 'EXAM', 'RESULT', 'CHAT', 'REMINDER'], // Các loại thông báo
        default: 'SYSTEM'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    data: { // Lưu thêm dữ liệu (ví dụ: link đến bài thi, id bài viết...) để khi bấm vào sẽ navigate
        type: Object,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // (Tuỳ chọn) Tự động xoá sau 30 ngày để nhẹ database
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
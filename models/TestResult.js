const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    score: { type: Number, required: true }, // Điểm số (thang 10)
    correctCount: { type: Number, required: true }, // Số câu đúng
    totalQuestions: { type: Number, required: true }, // Tổng số câu
    // Lưu chi tiết để sau này làm Dashboard thống kê Tag
    details: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        userAnswer: String,
        isCorrect: Boolean,
        tags: [String] // Lưu snapshot tags tại thời điểm làm bài để thống kê nhanh
    }],
    completedAt: { type: Date, default: Date.now }
});

// Đảm bảo 1 user chỉ có 1 kết quả cho 1 bài test (Unique Compound Index)
TestResultSchema.index({ user: 1, test: 1 }, { unique: true });

module.exports = mongoose.model('TestResult', TestResultSchema);
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    // 1. Thêm type để phân loại (Factory cần cái này)
    type: {
        type: String,
        required: true,
        enum: ['SINGLE_CHOICE', 'MULTIPLE_SELECT'],
        default: 'SINGLE_CHOICE'
    },
    content: { type: String, required: true },

    // 2. Đổi sang Mixed để chứa được object hoặc mảng tùy loại câu hỏi
    options: { type: mongoose.Schema.Types.Mixed, required: true },

    // 3. Đổi sang Mixed (vì câu nhiều lựa chọn đáp án là mảng [])
    answer: { type: mongoose.Schema.Types.Mixed, required: true },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    updatedAt: { type: Date, default: Date.now },
    solution: { type: String },
    gradeLevel: { type: String, trim: true },
    testIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    imageUrl: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

module.exports = mongoose.model('Question', QuestionSchema);
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    content: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    updatedAt: { type: Date, default: Date.now },
    solution: { type: String },
    gradeLevel: { type: String, trim: true },
    testIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
});

module.exports = mongoose.model('Question', QuestionSchema);

const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    timeLimitMinutes: Number
});

module.exports = mongoose.model('Quiz', QuizSchema);

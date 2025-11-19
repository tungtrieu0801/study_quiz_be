const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ questionId: mongoose.Schema.Types.ObjectId, selected: String }],
    score: Number,
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);

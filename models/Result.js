const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['not-started', 'completed'], default: 'not-started' },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date }
});

module.exports = mongoose.model('Result', ResultSchema);

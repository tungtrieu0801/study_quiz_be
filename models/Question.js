const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    content: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: String, required: true },
    tags: [String]
});

module.exports = mongoose.model('Question', QuestionSchema);

const questionService = require("../services/questionService");
const { CreateQuestionDto } = require("../dtos/question/CreateQuestionDto");

exports.createQuestion = async (req, res) => {
    const questionDto = new CreateQuestionDto(req.body);
    const userInformation = req.user;
    try {
        const question = await questionService.createQuestion(questionDto, userInformation);
        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        })
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
}

exports.getQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const testId = req.query.testId;
        const userInformation = req.user;

        const result = await questionService.getQuestions({ page, size, testId, userInformation });

        res.json({
            success: true,
            data: result.questions,
            total: result.total,
            page,
            size,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.deleteQuestion = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
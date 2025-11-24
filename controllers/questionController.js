const questionService = require("../services/questionService");
const { CreateQuestionDto } = require("../dtos/question/CreateQuestionDto");
const {UpdateQuestionDto} = require("../dtos/question/UpdateQuestionDto");

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
        const { id } = req.params; // Lấy ID câu hỏi từ URL
        const questionDto = new UpdateQuestionDto(req.body);
        const userInformation = req.user;

        const updatedQuestion = await questionService.updateQuestion(id, questionDto, userInformation);

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });
    } catch (err) {
        let status = 500;
        if (err.message.includes('Only admins')) status = 403;
        if (err.message.includes('not found')) status = 404;

        res.status(status).json({ success: false, message: err.message });
    }
}

exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL (ví dụ: /questions/:id)

        // Giả sử middleware xác thực đã gán thông tin user vào req.user
        // req.user phải chứa { role: 'admin', ... }
        const userInformation = req.user;

        // Gọi sang service
        await questionService.deleteQuestion(id, userInformation);

        res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (err) {
        // Có thể check err.message để trả về 403 hoặc 404 tùy ý,
        // ở đây giữ nguyên 500 như mẫu của bạn
        res.status(500).json({ success: false, message: err.message });
    }
}
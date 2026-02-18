const questionService = require("../services/questionService");
const {CreateQuestionDto} = require("../dtos/question/CreateQuestionDto");
const {UpdateQuestionDto} = require("../dtos/question/UpdateQuestionDto");
const {uploadToR2} = require("../services/r2");
const normalizeAnswer = (body) => {
    // Các loại câu hỏi bắt buộc đáp án phải là Mảng (Array)
    // Bao gồm: Điền từ, Chọn nhiều, và Trả lời ngắn (vì mình đã nâng cấp UI nhập nhiều từ đồng nghĩa)
    const arrayTypes = ['FILL_IN_THE_BLANK', 'MULTIPLE_SELECT', 'SHORT_ANSWER'];

    if (arrayTypes.includes(body.type)) {
        // Nếu có answer và nó KHÔNG phải là array (do FormData gửi 1 item bị biến thành string)
        if (body.answer && !Array.isArray(body.answer)) {
            // Ép thành mảng
            body.answer = [body.answer];
        }
    }
    return body;
};

exports.createQuestion = async (req, res) => {
    try {
        let imageUrl = null;

        // 1. Xử lý upload ảnh lên Cloudflare R2
        if (req.file) {
            const uploadResult = await uploadToR2(req.file);
            imageUrl = uploadResult.location || uploadResult.url;
        }

        // 2. [FIX QUAN TRỌNG] Chuẩn hóa answer thành mảng trước khi tạo DTO
        normalizeAnswer(req.body);

        // 3. Gộp data
        const questionData = {
            ...req.body,
            imageUrl: imageUrl
        };

        const questionDto = new CreateQuestionDto(questionData);
        const userInformation = req.user;

        // 4. Gọi Service
        const question = await questionService.createQuestion(questionDto, userInformation);

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });

    } catch (err) {
        console.error("Create Question Error:", err);
        const status = err.message.includes('Only teacher') ? 403 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        let imageUrl = undefined;

        // 1. Xử lý upload ảnh (nếu có ảnh mới)
        if (req.file) {
            const uploadResult = await uploadToR2(req.file);
            imageUrl = uploadResult.location || uploadResult.url;
        }

        // 2. [FIX QUAN TRỌNG] Chuẩn hóa answer thành mảng khi update
        normalizeAnswer(req.body);

        // 3. Chuẩn bị data update
        const updateData = {
            ...req.body
        };

        // Chỉ cập nhật ảnh nếu có upload mới
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const userInformation = req.user;

        // 4. Gọi Service
        const updatedQuestion = await questionService.updateQuestion(id, updateData, userInformation);

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });

    } catch (err) {
        console.error("Update Question Error:", err);
        const status = err.message.includes('not found') ? 404 :
            err.message.includes('Unauthorized') ? 403 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const {id} = req.params;
        const userInformation = req.user;

        let imageUrl = null;
        if (req.file) {
            const uploadResult = await uploadToR2(req.file);
            imageUrl = uploadResult.location || uploadResult.url;
        }

        const updateData = {
            ...req.body,
        }
        if (imageUrl) updateData.imageUrl = imageUrl;
        const questionDto = new UpdateQuestionDto(updateData);
        const updatedQuestion = await questionService.updateQuestion(
            id,
            questionDto,
            userInformation
        )

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: updatedQuestion
        });
    } catch (err) {
        let status = 500;
        if (err.message.includes('Only admins')) status = 403;
        if (err.message.includes('not found')) status = 404;

        res.status(status).json({success: false, message: err.message});
    }
}

exports.getQuestions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;
        const testId = req.query.testId;
        const userInformation = req.user;

        const result = await questionService.getQuestions({page, size, testId, userInformation});

        res.json({
            success: true,
            data: result.questions,
            total: result.total,
            page,
            size,
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const {id} = req.params; // Lấy ID từ URL (ví dụ: /questions/:id)

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
        res.status(500).json({success: false, message: err.message});
    }
}

exports.submitTest = async (req, res) => {
    try {
        const userInformation = req.user; // Lấy thông tin user từ token
        // req.body cần có { testId: "...", answers: {...} }
        const result = await questionService.submitTest(req.body, userInformation);

        res.status(200).json({
            success: true,
            message: "Nộp bài thành công",
            data: result
        });
    } catch (err) {
        // Nếu lỗi do trùng lặp (đã làm rồi)
        if (err.code === 11000 || err.message.includes("đã làm bài")) {
            return res.status(400).json({success: false, message: "Bạn đã hoàn thành bài thi này rồi."});
        }
        res.status(500).json({success: false, message: err.message});
    }
};

exports.getQuestionsByIds = async (req, res) => {
    try {
        const {ids} = req.body;
        const userInformation = req.user;

        const questions = await questionService.getQuestionsByIds(ids, userInformation);

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
};
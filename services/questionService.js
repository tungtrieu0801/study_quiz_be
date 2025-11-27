const Question = require('../models/Question');
const TestResult = require('../models/TestResult')
/**
 * Register new user
 * @param {CreateQuestionDto} dto
 * @param userInformation include userId and role
 */
exports.createQuestion = async (dto, userInformation) => {
    dto.validate();
    const userRole = userInformation.role;
    if ('admin' === userRole) {
        const question = new Question({
            content: dto.content,
            options: dto.options,
            answer: dto.answer,
            updatedAt: new Date(dto.updatedAt),
            tags: dto.tags,
            solution: dto.solution,
            gradeLevel: dto.gradeLevel,
            testIds: dto.testIds,
        })
        await question.save();
        return question;
    } else {
        return { error: 'Only admins can create questions' };
    }
}

exports.getQuestions = async ({ page = 1, size = 10, testId, userInformation }) => {
    const filter = {};
    if (testId) filter.testIds = testId;

    // Đảm bảo page không nhỏ hơn 1
    const currentPage = Math.max(1, page);

    // Công thức cho trang bắt đầu từ 1: (trang - 1) * số lượng
    const skip = (currentPage - 1) * size;

    const query = Question.find(filter)
        .skip(skip)
        .limit(size)
        .sort({ updatedAt: -1 });

    // Chạy song song query data và count tổng số bản ghi để tối ưu
    const [questions, total] = await Promise.all([
        query,
        Question.countDocuments(filter)
    ]);

    return { questions, total };
};

exports.updateQuestion = async (id, dto, userInformation) => {
    // 1. Validate dữ liệu đầu vào
    dto.validate();

    // 2. Kiểm tra quyền Admin
    if (userInformation.role !== 'admin') {
        throw new Error('Only admins can update questions');
    }

    // 3. Tạo object update (chỉ lấy các trường có dữ liệu)
    const updateData = {};
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.options !== undefined) updateData.options = dto.options;
    if (dto.answer !== undefined) updateData.answer = dto.answer;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.solution !== undefined) updateData.solution = dto.solution;
    if (dto.gradeLevel !== undefined) updateData.gradeLevel = dto.gradeLevel;
    if (dto.testIds !== undefined) updateData.testIds = dto.testIds;

    // Luôn cập nhật thời gian sửa đổi
    updateData.updatedAt = new Date();

    // 4. Thực hiện update
    // { new: true } trả về document sau khi đã update
    // { runValidators: true } để mongoose kiểm tra lại schema
    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    // 5. Kiểm tra xem câu hỏi có tồn tại không
    if (!updatedQuestion) {
        throw new Error('Question not found');
    }

    return updatedQuestion;
};

// Service: Xử lý logic xóa
exports.deleteQuestion = async (id, userInformation) => {
    // 1. Kiểm tra quyền Admin (tương tự như create/update)
    if (userInformation.role !== 'admin') {
        throw new Error('Only admins can delete questions');
    }

    // 2. Tìm và xóa câu hỏi theo ID
    const deletedQuestion = await Question.findByIdAndDelete(id);

    // 3. Kiểm tra xem câu hỏi có tồn tại không
    if (!deletedQuestion) {
        throw new Error('Question not found');
    }

    return deletedQuestion;
};

exports.submitTest = async (submissionData, userInformation) => {
    const { testId, answers } = submissionData;
    const userId = userInformation.id;

    // 1. Kiểm tra: Học sinh đã làm bài này chưa?
    const existingResult = await TestResult.findOne({ user: userId, test: testId });
    if (existingResult) {
        throw new Error("Bạn đã làm bài kiểm tra này rồi, không thể nộp lại.");
    }

    // --- SỬA ĐỔI TỪ ĐÂY ---

    // 2. Lấy TOÀN BỘ câu hỏi của bài thi này từ DB
    // (Lưu ý: Bạn cần đảm bảo Model Question có trường testId,
    // hoặc logic lấy danh sách câu hỏi phải khớp với cách bạn lưu DB)
    const questions = await Question.find({ testIds: testId });

    if (!questions || questions.length === 0) {
        throw new Error("Đề thi này chưa có câu hỏi.");
    }

    let correctCount = 0;
    const resultDetails = [];
    const userAnswersMap = answers || {}; // Đảm bảo không bị null

    // 3. Chấm điểm
    questions.forEach(q => {
        // Lấy đáp án user gửi lên, nếu không có thì là null/undefined
        const userAnswer = userAnswersMap[q._id.toString()];

        // So sánh: Nếu user không trả lời (undefined) thì auto sai
        const isCorrect = userAnswer === q.answer;

        if (isCorrect) correctCount++;

        resultDetails.push({
            questionId: q._id,
            userAnswer: userAnswer || null, // Lưu null nếu không trả lời
            isCorrect: isCorrect,
            tags: q.tags
        });
    });

    const score = parseFloat(((correctCount / questions.length) * 10).toFixed(2));

    // 4. Lưu kết quả vào DB (BẮT BUỘC CHẠY KỂ CẢ KHI 0 ĐIỂM)
    const newResult = new TestResult({
        user: userId,
        test: testId,
        score: score,
        correctCount: correctCount,
        totalQuestions: questions.length,
        details: resultDetails
    });

    await newResult.save();

    // 5. Trả về kết quả
    return {
        _id: newResult._id,
        score,
        correctCount,
        total: questions.length,
        details: resultDetails.map(d => ({
            questionId: d.questionId,
            isCorrect: d.isCorrect,
            userAnswer: d.userAnswer,
            // Tìm lại thông tin câu hỏi để trả về solution
            correctAnswer: questions.find(q => q._id.equals(d.questionId)).answer,
            solution: questions.find(q => q._id.equals(d.questionId)).solution
        }))
    };
};

/**
 * Get list quesion by list id
 * @param {Array<String>} ids - Array include list question id
 * @param {Object} userInformation - User information
 */
exports.getQuestionsByIds = async (ids, userInformation) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return [];
    }
    let query = Question.find({ _id: { $in: ids } });
    const questions = await query;
    return questions;
};
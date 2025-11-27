const Question = require('../models/Question');
const TestResult = require('../models/TestResult')
const QuestionFactory  = require('../patterns/QuestionFactory');

// Helper function để so sánh đáp án (Chấm điểm)
function checkAnswer(questionType, userAnswer, systemAnswer) {
    if (questionType === 'MULTIPLE_SELECT') {
        // So sánh 2 mảng: Phải có cùng độ dài và cùng phần tử
        if (!Array.isArray(userAnswer) || !Array.isArray(systemAnswer)) return false;
        if (userAnswer.length !== systemAnswer.length) return false;
        const sortedUser = [...userAnswer].sort();
        const sortedSystem = [...systemAnswer].sort();
        return sortedUser.every((value, index) => value === sortedSystem[index]);
    }
    // Mặc định so sánh chuỗi (SINGLE_CHOICE)
    return userAnswer === systemAnswer;
}

/**
 * Register new user
 * @param {CreateQuestionDto} dto
 * @param userInformation include userId and role
 */
exports.createQuestion = async (dto, userInformation) => {
    if (userInformation.role !== 'admin') {
        throw new Error('Only admins can create questions');
    }

    // Factory decide what type of question will be created.
    const questionProduct = QuestionFactory.createQuestion(dto);

    // Validate data for every question type
    questionProduct.validate();

    // Get data validated
    const validData = questionProduct.getData();

    const question = new Question({
        ...validData,
        solution: dto.solution,
        gradeLevel: dto.gradeLevel,
        updatedAt: new Date(),
        // Các trường ref giữ nguyên
        tags: dto.tags,
        testIds: dto.testIds,
    });

    await question.save();
    return question;
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

    // ... (Giữ nguyên đoạn kiểm tra existingResult) ...
    const existingResult = await TestResult.findOne({ user: userId, test: testId });
    if (existingResult) {
        throw new Error("Bạn đã làm bài kiểm tra này rồi, không thể nộp lại.");
    }

    const questions = await Question.find({ testIds: testId });
    if (!questions || questions.length === 0) {
        throw new Error("Đề thi này chưa có câu hỏi.");
    }

    let correctCount = 0;
    const resultDetails = [];
    const userAnswersMap = answers || {};

    // CHẤM ĐIỂM
    questions.forEach(q => {
        const userAnswer = userAnswersMap[q._id.toString()];

        // SỬ DỤNG HELPER ĐỂ SO SÁNH (Vì giờ đáp án có thể là Array)
        const isCorrect = checkAnswer(q.type, userAnswer, q.answer);

        if (isCorrect) correctCount++;

        resultDetails.push({
            questionId: q._id,
            userAnswer: userAnswer || null,
            isCorrect: isCorrect,
            tags: q.tags
        });
    });

    const score = parseFloat(((correctCount / questions.length) * 10).toFixed(2));

    const newResult = new TestResult({
        user: userId,
        test: testId,
        score: score,
        correctCount: correctCount,
        totalQuestions: questions.length,
        details: resultDetails
    });

    await newResult.save();

    return {
        _id: newResult._id,
        score,
        correctCount,
        total: questions.length,
        details: resultDetails.map(d => ({
            questionId: d.questionId,
            isCorrect: d.isCorrect,
            userAnswer: d.userAnswer,
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
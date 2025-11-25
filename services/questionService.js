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

exports.getQuestions = async ({ page = 0, size = 10, testId, userInformation }) => {
    const filter = {};

    // Nếu có testId → lọc
    if (testId) {
        filter.testIds = testId;
    }

    let query = Question.find(filter)
        .skip(page * size)
        .limit(size)
        .sort({ updatedAt: -1 });

    if ('admin' === userInformation.role) {
        query = query.select('-answer'); // loại bỏ trường answer
    }

    const questions = await query;

    const total = await Question.countDocuments(filter);

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

    // 2. Lấy câu hỏi từ DB
    // Giả sử submissionData gửi lên danh sách questionIds hoặc ta query từ Test
    // Ở đây ta query dựa trên keys của answers gửi lên
    const questionIds = Object.keys(answers || {});
    if (questionIds.length === 0) return { score: 0 };

    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctCount = 0;
    const resultDetails = [];

    // 3. Chấm điểm
    questions.forEach(q => {
        const userAnswer = answers[q._id.toString()];
        const isCorrect = userAnswer === q.answer;

        if (isCorrect) correctCount++;

        resultDetails.push({
            questionId: q._id,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            tags: q.tags // Lưu tag lại để thống kê Dashboard sau này
        });
    });

    const score = parseFloat(((correctCount / questions.length) * 10).toFixed(2));

    // 4. Lưu kết quả vào DB
    const newResult = new TestResult({
        user: userId,
        test: testId,
        score: score,
        correctCount: correctCount,
        totalQuestions: questions.length,
        details: resultDetails
    });

    await newResult.save();

    // 5. Trả về kết quả (Chưa trả về chi tiết solution ngay nếu muốn bảo mật tuyệt đối,
    // nhưng ở đây ta trả về để FE xử lý hiển thị "Xem chi tiết")
    return {
        _id: newResult._id,
        score,
        correctCount,
        total: questions.length,
        // Trả về chi tiết để FE tô màu
        details: resultDetails.map(d => ({
            questionId: d.questionId,
            isCorrect: d.isCorrect,
            userAnswer: d.userAnswer,
            // Cần join lại questions gốc để lấy solution trả về cho FE hiển thị
            correctAnswer: questions.find(q => q._id.equals(d.questionId)).answer,
            solution: questions.find(q => q._id.equals(d.questionId)).solution
        }))
    };
};
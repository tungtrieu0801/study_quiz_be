const Question = require('../models/Question');
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
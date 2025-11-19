const Question = require('../models/Question');
/**
 * Register new user
 * @param {CreateQuestionDto} dto
 * @param userInformation include userId and role
 */
exports.createQuestion = async (dto, userInformation) => {
    dto.validate();
    const userRole = userInformation.role;
    if ('student' === userRole) {
        const question = new Question({
            content: dto.content,
            options: dto.options,
            answer: dto.answer,
            updatedAt: new Date(dto.updatedAt),
            tags: dto.tags,
            solution: dto.solution,
            gradeLevel: dto.gradeLevel
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

    if ('student' === userInformation.role) {
        query = query.select('-answer'); // loại bỏ trường answer
    }

    const questions = await query;

    const total = await Question.countDocuments(filter);

    return { questions, total };
};
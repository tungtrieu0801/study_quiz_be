const Test = require('../models/Test');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');
/**
 * Create a new test
 *
 * @param {CreateTestDto} dto
 * @param userInformation include userId and role
 */
exports.createTest = async (dto, userInformation) => {
    dto.validate();
    const userRole = userInformation.role;
    if ('student' === userRole) {
        const test = new Test({
            title: dto.title,
            description: dto.description,
            questions: dto.questions,
            createdBy: userInformation.id,
            duration: dto.duration,
            gradeLevel: dto.gradeLevel,
            tags: dto.tags,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        });
        await test.save();
        return test;
    } else {
        return { error: 'Only admins can create tests' };
    }
};

exports.getListTests = async ({ page = 0, size = 10, userInformation}) => {
    const filter = {};
    let query = Test.find(filter)
        .skip(page)
        .limit(size)
        .sort({ updatedAt: -1 });
    const tests = await query;
    const total = await Test.countDocuments(filter);
    return { tests, total };
}

exports.updateTest = async () => {}

exports.deleteTest = async () => {}


const Test = require('../models/Test');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');

/**
 * Create a new test
 * @param {CreateTestDto} dto
 * @param userInformation include userId and role
 */
exports.createTest = async (dto, userInformation) => {
    dto.validate();
    const userRole = userInformation.role;
    if ('admin' === userRole) {
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
        throw new Error('Only admins can create tests');
    }
};

exports.getListTests = async ({ page = 0, size = 10, userInformation }) => {
    const filter = {};

    // Lưu ý: Logic phân trang thường là skip(page * size) thay vì skip(page)
    // Nếu page là số trang (0, 1, 2...), hãy sửa thành: .skip(page * size)
    // Nếu page là số bản ghi cần bỏ qua (offset), giữ nguyên .skip(page)

    let query = Test.find(filter)
        .skip(page * size) // Sửa lại chuẩn logic phân trang (Trang 0 bỏ qua 0, Trang 1 bỏ qua 10...)
        .limit(size)
        .sort({ updatedAt: -1 });

    const tests = await query;
    const total = await Test.countDocuments(filter);
    return { tests, total };
}

/**
 * Get test detail by ID
 * @param {string} id
 */
exports.getTestDetail = async (id) => {
    const test = await Test.findById(id).populate('questions');
    return test;
}

/**
 * Update a test
 * @param {string} id
 * @param {object} updateData
 * @param {object} userInformation
 */
exports.updateTest = async (id, updateData, userInformation) => {
    // 1. Check quyền Admin
    if (userInformation.role !== 'admin') {
        throw new Error('Only admins can update tests');
    }

    // 2. Cập nhật thời gian update
    updateData.updatedAt = new Date();

    // 3. Thực hiện update
    // { new: true } trả về document mới sau khi update
    const updatedTest = await Test.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!updatedTest) {
        throw new Error('Test not found');
    }

    return updatedTest;
}

/**
 * Delete a test
 * @param {string} id
 * @param {object} userInformation
 */
exports.deleteTest = async (id, userInformation) => {
    // 1. Check quyền Admin
    if (userInformation.role !== 'admin') {
        throw new Error('Only admins can delete tests');
    }

    // 2. Thực hiện xóa
    const deletedTest = await Test.findByIdAndDelete(id);

    if (!deletedTest) {
        throw new Error('Test not found');
    }

    return deletedTest;
}
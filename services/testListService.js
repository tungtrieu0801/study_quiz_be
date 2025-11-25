const Test = require('../models/Test');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');
const TestResult = require('../models/TestResult');
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

// Thay thế hàm getTestList hiện tại trong file Service của bạn
// Loại bỏ 'req, res' và chỉ nhận destructuring object
exports.getTestList = async ({ page, size, userInformation }) => {

    // Khai báo lại userRole và userId từ userInformation
    const userRole = userInformation.role;
    const userId = userInformation.id;

    // 1. Lấy tất cả bài thi
    const tests = await Test.find().sort({ createdAt: -1 });

    // Lấy tổng số lượng (để Controller có thể tính Pagination)
    const total = await Test.countDocuments({});

    // 2. Xử lý logic cho Admin (trả về danh sách thô)
    if (userRole === 'admin') {
        // Chỉ trả về data và total
        return { tests, total };
    }

    // 3. Nếu là Student: Kiểm tra trạng thái đã làm
    const takenResults = await TestResult.find({ user: userId }).select('test score');

    // Map lại danh sách test để thêm field 'isTaken' và 'score'
    const testsWithStatus = tests.map(test => {
        const result = takenResults.find(r => r.test.toString() === test._id.toString());
        return {
            // Dùng .toObject() để đảm bảo có thể thêm các property mới như isTaken
            ...test.toObject(),
            isTaken: !!result,
            score: result ? result.score : null
        };
    });

    // Trả về object result đúng format Controller mong đợi
    return { tests: testsWithStatus, total };
};

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

// ... (các hàm cũ create, get, update, delete)

/**
 * Lấy thống kê chi tiết cho một bài thi
 */
exports.getTestStatistics = async (testId) => {
    // 1. Lấy tất cả kết quả của bài thi này
    const results = await TestResult.find({ test: testId })
        .populate('user', 'fullName email username') // Lấy thông tin học sinh
        .sort({ score: -1 }); // Sắp xếp điểm từ cao xuống thấp

    if (!results || results.length === 0) {
        return {
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            leaderboard: [],
            tagAnalysis: [],
            scoreDistribution: [0, 0, 0, 0, 0] // 0-2, 2-4, 4-6, 6-8, 8-10
        };
    }

    // 2. Tính toán số liệu tổng quan
    const totalAttempts = results.length;
    const scores = results.map(r => r.score);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = (scores.reduce((a, b) => a + b, 0) / totalAttempts).toFixed(2);

    // 3. Phân bố phổ điểm (0-2, 2-4, 4-6, 6-8, 8-10)
    const scoreDistribution = [0, 0, 0, 0, 0];
    scores.forEach(s => {
        if (s < 2) scoreDistribution[0]++;
        else if (s < 4) scoreDistribution[1]++;
        else if (s < 6) scoreDistribution[2]++;
        else if (s < 8) scoreDistribution[3]++;
        else scoreDistribution[4]++;
    });

    // 4. Phân tích Tag (Tag nào hay bị làm sai nhất?)
    const tagStats = {}; // { "Đại số": { total: 10, wrong: 5 } }

    results.forEach(result => {
        result.details.forEach(detail => {
            // Duyệt qua từng tag của câu hỏi
            if (detail.tags && detail.tags.length > 0) {
                detail.tags.forEach(tagName => {
                    if (!tagStats[tagName]) {
                        tagStats[tagName] = { name: tagName, wrongCount: 0, totalAppear: 0 };
                    }
                    tagStats[tagName].totalAppear++;
                    if (!detail.isCorrect) {
                        tagStats[tagName].wrongCount++;
                    }
                });
            }
        });
    });

    // Chuyển object tagStats thành array và tính % sai
    const tagAnalysis = Object.values(tagStats).map(t => ({
        tag: t.name,
        wrongCount: t.wrongCount,
        total: t.totalAppear,
        wrongRate: ((t.wrongCount / t.totalAppear) * 100).toFixed(1)
    })).sort((a, b) => b.wrongRate - a.wrongRate); // Sắp xếp tag sai nhiều nhất lên đầu

    return {
        totalAttempts,
        averageScore,
        highestScore,
        lowestScore,
        scoreDistribution, // Mảng 5 phần tử
        tagAnalysis: tagAnalysis.slice(0, 10), // Lấy top 10 tag sai nhiều nhất
        leaderboard: results // Danh sách học sinh đã sort
    };
};
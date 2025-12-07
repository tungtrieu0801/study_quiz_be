const Test = require('../models/Test');
const User = require('../models/User');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');
const TestResult = require('../models/TestResult');
const notificationService = require('../services/notificationService');
/**
 * Create a new test
 * @param {CreateTestDto} dto
 * @param userInformation include userId and role
 */
exports.createTest = async (dto, userInformation) => {
    dto.validate();
    const userRole = userInformation.role;
    if ('teacher' === userRole) {
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
            teacherId: dto.teacherId,
        });
        await test.save();

        // Create notification
        try {
            const students = await User.find({
                role: 'student',
            }).select('_id');
            const notificationPromises = students.map(student => {
                return notificationService.createNotification({
                    recipient: student._id,
                    sender: userInformation.id, // Admin gửi
                    type: 'EXAM', // Loại thông báo là bài thi
                    title: `Bài kiểm tra mới: ${dto.title}`,
                    content: `Cô giáo vừa thêm bài kiểm tra 'mới cho khối ${dto.gradeLevel}. Thời gian làm bài: ${dto.duration} phút.`,
                    data: { testId: test._id } // Gắn ID bài thi vào để FE click vào là mở ngay
                });
            });
            await Promise.all(notificationPromises);
            console.log(`Đã gửi thông báo bài thi mới cho ${students.length} học sinh.`);
        } catch (e) {
            console.error("Lỗi khi gửi thông báo bài thi mới:", error);
        }

        return test;
    } else {
        throw new Error('Only admins can create tests');
    }
};
exports.getTestList = async ({ page, size, userInformation }) => {
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const skip = (pageNum - 1) * sizeNum;

    const userRole = userInformation.role;
    const userId = userInformation.id;

    const queryCondition = {};
    if (userRole === "teacher") {
        queryCondition.teacherId = userId;
    } else if (userRole === "student") {
        queryCondition.teacherId = userInformation.teacherId;
    }

    // ===== 2. Đếm tổng cho FE =====
    const total = await Test.countDocuments(queryCondition);

    // ===== 3. Query danh sách test theo filter + phân trang =====
    const tests = await Test.find(queryCondition)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(sizeNum);

    // ===== 4. Nếu admin → trả về luôn =====
    if (userRole === "admin") {
        return { tests, total };
    }

    // ===== 5. Nếu student → bổ sung trạng thái đã làm
    if (userRole === "student") {
        const testIdsOnPage = tests.map(t => t._id);

        const takenResults = await TestResult.find({
            user: userId,
            test: { $in: testIdsOnPage }
        }).select("test score");

        const testsWithStatus = tests.map(test => {
            const result = takenResults.find(r => r.test.toString() === test._id.toString());
            return {
                ...test.toObject(),
                isTaken: !!result,
                score: result ? result.score : null
            };
        });

        return { tests: testsWithStatus, total };
    }

    // ===== 6. Teacher → trả danh sách test của giáo viên =====
    return { tests, total };
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
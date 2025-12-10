const testListService = require('../services/testListService');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');

// 1. CREATE
exports.createTest = async (req, res) => {
    const testDto = new CreateTestDto(req.body);
    const userInformation = req.user;
    try {
        testDto.teacherId = userInformation.id;
        const newTest = await testListService.createTest(testDto, userInformation);
        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: newTest
        });
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
}

// 2. GET LIST
exports.getListTests = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const userInformation = req.user;

        const result = await testListService.getTestList({ page, size, userInformation });

        res.status(200).json({
            success: true,
            data: result.tests,
            total: result.total,
            page,
            size
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. GET DETAIL (Cái này để fix lỗi 404 ở frontend)
exports.getTestDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const test = await testListService.getTestDetail(id);

        if (!test) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        res.status(200).json({
            success: true,
            data: test
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. UPDATE
exports.updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const userInformation = req.user;

        const updatedTest = await testListService.updateTest(id, updateData, userInformation);

        res.status(200).json({
            success: true,
            message: 'Test updated successfully',
            data: updatedTest
        });
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 :
            err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
}

// 5. DELETE
exports.deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const userInformation = req.user;

        await testListService.deleteTest(id, userInformation);

        res.status(200).json({
            success: true,
            message: 'Test deleted successfully'
        });
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 :
            err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
}

exports.getTestStatistics = async (req, res) => {
    try {
        const { id } = req.params; // testId
        const stats = await testListService.getTestStatistics(id);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
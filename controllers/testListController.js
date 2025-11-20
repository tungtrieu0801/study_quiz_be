const testListService = require('../services/testListService');
const { CreateTestDto } = require('../dtos/testList/CreateTestDto');

exports.createTest = async (req, res) => {
    console.log(req.body);
    const testDto = new CreateTestDto(req.body);
    const userInformation = req.user;
    try {

        const newTest = await testListService.createTest(testDto, userInformation);
        res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: newTest
        });
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 : 500;
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.getListTests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;   // trang hiện tại, mặc định 0
        const size = parseInt(req.query.size) || 10;  // số item / trang, mặc định 10
        const userInformation = req.user;             // nếu cần phân quyền

        const result = await testListService.getListTests({ page, size, userInformation });

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

exports.deleteTest = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.updateTest = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
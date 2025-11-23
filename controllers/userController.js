const userService = require('../services/userService');
const UpdateUserDto = require('../dtos/user/UpdateUserDto');

exports.updateUser = async (req, res) => {
    const dto = new UpdateUserDto(req.body);
    const userInformation = req.user;
    if (userInformation.id !== dto.userId ) {
        res.status(403).json({ success: false, error: "Forbidden" });
    }
    try {
        const updatedUser = await userService.updateUser(dto);
        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (e) {
        res.status(400).json({ success: false, error: e });
    }
}

exports.getStudents = async (req, res) => {
    const userInformation = req.user;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const gradeLevel = req.query.gradeLevel;
    const studentName = req.query.studentName;
    try {
        const listStudent = await userService.getStudents(page, size, gradeLevel, studentName);
        res.status(200).json({
            status: "success",
            message: "User Information",
            data: listStudent,
        })
    } catch (e) {
        res.status(400).json({ success: false, error: e });
    }
}
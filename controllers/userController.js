const userService = require('../services/userService');
const UpdateUserDto = require('../dtos/user/UpdateUserDto');

exports.updateUser = async (req, res) => {
    const dto = new UpdateUserDto(req.body);
    const userInformation = req.user;
    if ("admin" === userInformation.role) {
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
    } else {
        res.status(400).json({ success: false, error: "User not found" });
    }
}

exports.getListUser = async (req, res) => {
    const userInformation = req.user;
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const gradeLevel = req.query.gradeLevel;
    const studentName = req.query.studentName;
    const role = req.query.role;
    try {
        const listStudent = await userService.getListUser(page, size, gradeLevel, studentName, role);
        res.status(200).json({
            status: "success",
            message: "User Information",
            data: listStudent,
        })
    } catch (e) {
        res.status(400).json({ success: false, error: e });
    }
}

// user.controller.js

// controllers/user.controller.js

exports.migrateFirstNames = async (req, res) => {
    try {
        // Gọi hàm xử lý logic bên service
        const count = await userService.migrateFirstNames();

        // Trả về kết quả thành công
        return res.status(200).json({
            status: "success",
            message: "Migration completed successfully",
            updatedCount: count
        });

    } catch (error) {
        console.error("Migration Error:", error);
        // Trả về lỗi server
        return res.status(500).json({
            status: "error",
            message: "Migration failed",
            error: error.message
        });
    }
};
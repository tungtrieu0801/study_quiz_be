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
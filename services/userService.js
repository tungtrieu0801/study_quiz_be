const User = require('../models/User');

exports.updateUser = async (dto) => {
    try {
        const user = await User.findById(dto.userId); // chỉ cần 1 tham số

        if (!user) {
            return { error: "User not found" };
        }
        if (dto.fullName !== undefined) user.fullName = dto.fullName;
        await user.save();
        return user;
    } catch (e) {
        return { error: "Cannot update user" };
    }
}
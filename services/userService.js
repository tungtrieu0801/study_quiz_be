const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateUser = async (dto) => {
    try {
        const user = await User.findById(dto.userId); // chỉ cần 1 tham số

        if (!user) {
            return { error: "User not found" };
        }
        if (dto.fullName !== undefined) user.fullName = dto.fullName;
        if (dto.username !== undefined) user.username = dto.username;
        if (dto.gradeLevel !== undefined) user.gradeLevel = dto.gradeLevel;
        if (dto.password !== undefined) {
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        await user.save();
        user.password = undefined;
        return user;
    } catch (e) {
        return { error: "Cannot update user" };
    }
}

exports.getStudents = async (page, size, gradeLevel, studentName) => {

    const filter = { role: "student" };

    if (gradeLevel !== undefined && gradeLevel !== null && gradeLevel !== "") {
        filter.gradeLevel = gradeLevel;
    }

    if (studentName && studentName.trim() !== "") {
        filter.fullName = { $regex: studentName, $options: "i" };
    }

    const students = await User.find(filter)
        .skip(page * size)
        .limit(size)
        .sort({ updatedAt: -1 });

    const total = await User.countDocuments(filter);

    return { students, total };
};

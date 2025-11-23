const User = require('../models/User');
const Question = require("../models/Question");

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

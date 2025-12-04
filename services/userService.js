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

exports.getListUser = async (page, size, gradeLevel, studentName, role) => {
    const filter = {};
    if (role !== undefined && role !== null && role !== "") {
        filter.role = role;
    }

    if (gradeLevel !== undefined && gradeLevel !== null && gradeLevel !== "") {
        filter.gradeLevel = gradeLevel;
    }

    if (studentName && studentName.trim() !== "") {
        filter.fullName = { $regex: studentName, $options: "i" };
    }

    const students = await User.find(filter)
        .skip(page * size)
        .limit(size)
        .collation({ locale: "vi", strength: 1 })
        .sort({ firstName: 1, fullName: 1, id: 1 });

    const total = await User.countDocuments(filter);

    return { students, total };
};


exports.migrateFirstNames = async () => {
    // Lấy toàn bộ user
    const users = await User.find({});
    let count = 0;

    for (const user of users) {
        if (user.fullName) {
            // Logic tách tên
            const parts = user.fullName.trim().split(/\s+/);
            const newFirstName = parts[parts.length - 1];

            // Chỉ update nếu chưa có hoặc khác biệt
            if (user.firstName !== newFirstName) {
                user.firstName = newFirstName;

                // Lưu lại (sẽ kích hoạt pre-save hook nếu có, nhưng gán trực tiếp cho chắc)
                await user.save();
                count++;
            }
        }
    }

    // Trả về số lượng đã update cho Controller
    return count;
};
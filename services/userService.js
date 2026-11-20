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
        if (dto.class !== undefined) user.class = dto.class;
        if (dto.password !== undefined && dto.password.trim() !== "") {
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        await user.save();
        const userObj = user.toObject();
        delete userObj.passwordHash;
        delete userObj.password;
        return userObj;
    } catch (e) {
        return { error: "Cannot update user" };
    }
}

exports.getListUser = async (userInformation, page, size, gradeLevel, studentName, role, teacherId, classParam) => {
    const filter = {};
    if (role !== undefined && role !== null && role !== "") {
        filter.role = role;
    }

    if (gradeLevel !== undefined && gradeLevel !== null && gradeLevel !== "") {
        filter.gradeLevel = gradeLevel;
    }

    if (classParam !== undefined && classParam !== null && classParam !== "") {
        filter.class = classParam;
    }

    if (studentName && studentName.trim() !== "") {
        filter.fullName = { $regex: studentName, $options: "i" };
    }

    if (teacherId && teacherId.trim() !== "") {
        filter.teacherId = {
            $in: [teacherId.trim()]
        };
    }

    const pageNum = !isNaN(page) && page >= 0 ? page : 0;
    const sizeNum = !isNaN(size) && size > 0 ? size : 10;

    const rawStudents = await User.find(filter)
        .select('-passwordHash')
        .skip(pageNum * sizeNum)
        .limit(sizeNum)
        .collation({ locale: "vi", strength: 1 })
        .sort({ firstName: 1, fullName: 1, id: 1 })
        .lean();

    const students = rawStudents.map(student => {
        delete student.passwordHash;
        if (!student.class && student.gradeLevel) {
            student.class = student.gradeLevel;
        }
        return student;
    });

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
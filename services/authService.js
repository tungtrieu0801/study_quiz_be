const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
/**
 * Register new user
 * @param {RegisterUserDto} dto
 */
exports.registerUser = async (dto) => {
    dto.validate();

    const existingUser = await User.findOne({ username: dto.username });
    if (existingUser) throw new Error('Username already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new User({
        username: dto.username,
        passwordHash: passwordHash,
        gradeLevel: dto.gradeLevel,
        fullName: dto.fullName,
        teacherId: dto.teacherId,
    });
    await user.save();

    return {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
    };
};


/**
 * Login user
 * @param {LoginUserDto} dto
 */
exports.loginUser = async (dto) => {
    dto.validate();

    const user = await User.findOne({ username: dto.username });
    console.log(user)
    if (!user) throw new AppError('Nhập sai thông tin tài khoản', 401);

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new AppError('Mật khẩu không chính xác', 401);

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
            teacherId: user.role === 'student' ? user.teacherId : undefined,
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName !== undefined ? user.fullName : user.username,
            role: user.role,
            teacherId: user.role === "student" ? user.teacherId : undefined,
        }
    };
};

exports.bulkRegister = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
        throw new AppError("Users must be a non-empty array", 400);
    }

    if (users.length > 100) {
        throw new AppError("Maximum 100 users per request", 400);
    }

    // Kiểm tra trùng username trong chính request
    const usernames = users.map(u => u.username);
    const duplicateInRequest = usernames.filter(
        (item, index) => usernames.indexOf(item) !== index
    );

    if (duplicateInRequest.length > 0) {
        throw new AppError("Duplicate usernames in request", 400);
    }

    const existingUsers = await User.find({
        username: { $in: usernames }
    }).select("username");

    const existingUsernames = existingUsers.map(u => u.username);

    // Lọc ra những user chưa tồn tại
    const validUsers = users.filter(
        u => !existingUsernames.includes(u.username)
    );

    if (validUsers.length === 0) {
        throw new AppError("All usernames already exist", 409);
    }

    const formattedUsers = await Promise.all(
        validUsers.map(async (u) => {
            const passwordHash = await bcrypt.hash(u.password, 10);

            return {
                username: u.username,
                passwordHash,
                gradeLevel: u.gradeLevel,
                fullName: u.fullName,
                teacherId: u.teacherId,
                role: u.role || "student"
            };
        })
    );

    const insertedUsers = await User.insertMany(formattedUsers, {
        ordered: false
    });

    return {
        insertedCount: insertedUsers.length,
        skipped: existingUsernames
    };
};

exports.updateUserRole = async (userId, role) => {
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    const allowedRoles = ["admin", "teacher", "student"];
    if (!allowedRoles.includes(role)) {
        throw new AppError("Invalid role value", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.role = role;
    await user.save();

    return {
        id: user._id,
        username: user.username,
        role: user.role
    };
};
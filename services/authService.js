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
    if (!user) throw new AppError('Nhập sai thông tin tài khoản', 401);

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new AppError('Mật khẩu không chính xác', 401);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3s' });

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName !== undefined ? user.fullName : user.username,
            role: user.role
        }
    };
};

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register new user
 * @param {RegisterUserDto} dto
 */
exports.registerUser = async (dto) => {
    dto.validate();

    const existingUser = await User.findOne({ username: dto.username });
    if (existingUser) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new User({ name: dto.username, passwordHash });
    await user.save();

    return {
        id: user._id,
        username: user.username,
    };
};

/**
 * Login user
 * @param {LoginUserDto} dto
 */
exports.loginUser = async (dto) => {
    dto.validate();

    const user = await User.findOne({ email: dto.email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

const authService = require('../services/authService');
const {RegisterUserDto} = require("../dtos/auth/RegisterUserDto");
const {LoginUserDto} = require("../dtos/auth/LoginUserDto");

exports.bulkRegister = async (req, res, next) => {
    try {
        const result = await authService.bulkRegister(req.body);

        res.status(201).json({
            success: true,
            message: "Bulk register completed",
            insertedCount: result.insertedCount,
            skippedUsernames: result.skipped
        });

    } catch (err) {
        next(err);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { userId, role } = req.body;

        const result = await authService.updateUserRole(userId, role);

        res.json({
            success: true,
            message: "Role updated successfully",
            data: result
        });
    } catch (err) {
        next(err);
    }
};

exports.register = async (req, res) => {
    const dto = new RegisterUserDto(req.body);
    try {
        const user = await authService.registerUser(dto);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (err) {
        const status = err.message.includes('registered') ? 409 : 400;
        res.status(status).json({ success: false, message: err.message });
    }
};

//add
exports.login = async (req, res, next) => {
    try {
        const dto = new LoginUserDto(req.body);
        console.log(dto);
        const result = await authService.loginUser(dto);
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (err) {
        next(err);
    }
};

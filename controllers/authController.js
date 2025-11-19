const authService = require('../services/authService');
const {RegisterUserDto} = require("../dtos/auth/RegisterUserDto");
const {LoginUserDto} = require("../dtos/auth/LoginUserDto");

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


exports.login = async (req, res) => {
    try {
        const dto = new LoginUserDto(req.body);
        const result = await authService.loginUser(dto);
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

const authService = require('../services/authService');
const {RegisterUserDto} = require("../dtos/auth/RegisterUserDto");
const {LoginUserDto} = require("../dtos/auth/LoginUserDto");


exports.register = async (req, res) => {
    try {
        const dto = new RegisterUserDto(req.body);
        const user = await authService.registerUser(dto);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (err) {
        if (err.message === 'Email already registered') {
            return res.status(409).json({ success: false, message: err.message });
        }
        res.status(400).json({ success: false, message: err.message });
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

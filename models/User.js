const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = require("express/lib/utils");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    createdAt: { type: Date, default: Date.now },
    fullName: { type: String, trim: true },
    gradeLevel: { type: String, trim: true },
    firstName: { type: String, trim: true },
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.passwordHash);
};

UserSchema.pre('save', function (next) {
    if (this.isModified("fullName") || this.isNew) {
        if (this.fullName) {
            const parts = this.fullName.trim().split(/\s+/);
            this.firstName = parts[parts.length - 1];
        }
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);

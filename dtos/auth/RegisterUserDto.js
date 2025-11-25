class RegisterUserDto {
    constructor({ username, password, gradeLevel, fullName }) {
        this.username = username?.trim();
        this.password = password.trim();
        this.gradeLevel = gradeLevel.trim();
        this.fullName = fullName.trim();
    }

    validate() {
        if (!this.username || !this.password || !this.gradeLevel) {
            throw new Error('Username, password, grade are required');
        }

    }
}

module.exports = { RegisterUserDto };

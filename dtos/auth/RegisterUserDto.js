class RegisterUserDto {
    constructor({ username, password, gradeLevel }) {
        this.username = username?.trim();
        this.password = password;
        this.gradeLevel = gradeLevel;
    }

    validate() {
        if (!this.username || !this.password || !this.gradeLevel) {
            throw new Error('Username, password, grade are required');
        }

    }
}

module.exports = { RegisterUserDto };

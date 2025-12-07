class RegisterUserDto {
    constructor({ username, password, gradeLevel, fullName, teacherId, role }) {
        this.username = username;
        this.password = password;
        this.gradeLevel = gradeLevel;
        this.fullName = fullName;
        this.teacherId = teacherId;
        this.role = role;
    }

    validate() {
        if (!this.username || !this.password) {
            throw new Error('Username, password are required');
        }

    }
}

module.exports = { RegisterUserDto };

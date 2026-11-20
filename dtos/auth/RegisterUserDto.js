class RegisterUserDto {
    constructor({ username, password, gradeLevel, class: classValue, className, fullName, teacherId, role }) {
        this.username = username;
        this.password = password;
        this.gradeLevel = gradeLevel;
        this.class = classValue || className;
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

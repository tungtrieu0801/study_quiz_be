class UpdateUserDto {
    constructor({ userId, fullName, username, password, gradeLevel }) {
        this.userId = userId;
        this.fullName = fullName;
        this.username = username;
        this.password = password;
        this.gradeLevel = gradeLevel;
    }
}

module.exports = UpdateUserDto;
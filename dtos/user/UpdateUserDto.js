class UpdateUserDto {
    constructor({ userId, fullName, username, password, gradeLevel, class: classValue, className }) {
        this.userId = userId;
        this.fullName = fullName;
        this.username = username;
        this.password = password;
        this.gradeLevel = gradeLevel;
        this.class = classValue || className;
    }
}

module.exports = UpdateUserDto;
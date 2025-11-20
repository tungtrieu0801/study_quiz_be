class UpdateUserDto {
    constructor({ userId, fullName }) {
        this.userId = userId;
        this.fullName = fullName;
    }
}

module.exports = UpdateUserDto;
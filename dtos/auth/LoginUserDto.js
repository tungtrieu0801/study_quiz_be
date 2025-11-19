class LoginUserDto {
    constructor({ username, password }) {
        this.username = username?.trim().toLowerCase();
        this.password = password;
    }

    validate() {
        if (!this.username || !this.password) {
            throw new Error('Username and password are required');
        }
    }
}

module.exports = { LoginUserDto };

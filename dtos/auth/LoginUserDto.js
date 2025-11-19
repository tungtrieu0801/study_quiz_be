class LoginUserDto {
    constructor({ email, password }) {
        this.email = email?.trim().toLowerCase();
        this.password = password;
    }

    validate() {
        if (!this.email || !this.password) {
            throw new Error('Email and password are required');
        }
    }
}

module.exports = { LoginUserDto };

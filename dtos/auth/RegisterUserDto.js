class RegisterUserDto {
    constructor({ name, email, password }) {
        this.name = name?.trim();
        this.email = email?.trim().toLowerCase();
        this.password = password;
    }

    validate() {
        if (!this.name || !this.email || !this.password) {
            throw new Error('Name, email, and password are required');
        }
        // Có thể thêm regex email, password strength...
    }
}

module.exports = { RegisterUserDto };

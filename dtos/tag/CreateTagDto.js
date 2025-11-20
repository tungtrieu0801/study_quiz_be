class CreateTagDto {
    constructor({ name, description }) {
        this.name = name;
        this.description = description;
    }

    validate() {
        if (!this.name) {
            throw new Error('Name is required');
        }
        if (!this.description) {
            throw new Error('Description is required');
        }
    }
}

module.exports = CreateTagDto;

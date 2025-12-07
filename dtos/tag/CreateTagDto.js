class CreateTagDto {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.createdBy = data.createdBy;
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

module.exports = { CreateTagDto };

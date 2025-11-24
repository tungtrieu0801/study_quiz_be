class UpdateTagDto {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
    }

    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Tag name is required');
        }
    }
}

module.exports = { UpdateTagDto };
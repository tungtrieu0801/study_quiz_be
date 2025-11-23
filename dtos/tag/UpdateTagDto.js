class UpdateTagDto {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
    }

    validate() {
        if (!this.name || this.name.trim() === "") {
            throw new Error("Tag name is required");
        }
        if (!this.description || this.description.trim() === "") {
            throw new Error("Tag description is required");
        }

        this.name = this.name.trim();
        this.description = this.description.trim();
    }
}

module.exports = UpdateTagDto;

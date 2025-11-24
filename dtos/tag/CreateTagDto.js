class CreateTagDto {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
    }

    // validate() {
    //     if (!this.name) {
    //         throw new Error('Name is required');
    //     }
    //     if (!this.description) {
    //         throw new Error('Description is required');
    //     }
    // }
}

module.exports = { CreateTagDto };

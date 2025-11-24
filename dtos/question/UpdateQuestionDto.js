class UpdateQuestionDto {
    constructor(data) {
        this.content = data.content;
        this.options = data.options;
        this.answer = data.answer;
        this.tags = data.tags;
        this.solution = data.solution;
        this.gradeLevel = data.gradeLevel;
        this.testIds = data.testIds;
    }

    validate() {
        // Validate cơ bản: Nếu trường options được gửi lên, nó phải là mảng
        if (this.options && !Array.isArray(this.options)) {
            throw new Error('Options must be an array');
        }

        // Nếu tags được gửi lên, nó phải là mảng
        if (this.tags && !Array.isArray(this.tags)) {
            throw new Error('Tags must be an array');
        }

        // Bạn có thể thêm các validate khác nếu cần
    }
}

module.exports = { UpdateQuestionDto };
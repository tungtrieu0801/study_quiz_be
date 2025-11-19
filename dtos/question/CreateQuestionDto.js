class CreateQuestionDto {
    constructor({ content, options, answer, tags, updatedAt, solution, gradeLevel }) {
        this.content = content;
        this.options = options;
        this.answer = answer;
        this.tags = tags;
        this.updatedAt = updatedAt || new Date();
        this.solution = solution;
        this.gradeLevel = gradeLevel;
    }

    validate() {
        if (!this.content || !this.options || !this.answer || !this.gradeLevel) {
            throw new Error('Content, options, and answer are required');
        }
        if (!Array.isArray(this.options) || this.options.length < 2) {
            throw new Error('Options must be an array with at least two items');
        }
        if (!this.options.includes(this.answer)) {
            throw new Error('Answer must be one of the options');
        }
    }
}

module.exports = { CreateQuestionDto };
class CreateTestDto {
    constructor({ title, description, questions, createdBy, duration, gradeLevel, tags, createdAt, updatedAt, teacherId }) {
        this.title = title;
        this.description = description;
        this.questions = questions || [];
        this.createdBy = createdBy;
        this.duration = duration;
        this.gradeLevel = gradeLevel;
        this.tags = tags || [];
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
        this.teacherId = teacherId;
    }

    validate() {
        if (!this.title || !this.description) {
            throw new Error('Title, description are required');
        }
        if (this.tags && !Array.isArray(this.tags)) {
            throw new Error('Tags must be an array');
        }
    }
}

module.exports = { CreateTestDto };
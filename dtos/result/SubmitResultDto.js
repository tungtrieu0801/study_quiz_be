class SubmitResultDto {
    constructor({ userId, testId, score, status, startedAt, finishedAt }) {
        this.userId = userId;
        this.testId = testId;
        this.score = score || 0;
        this.status = status || 'not-started';
        this.startedAt = startedAt || new Date();
        this.finishedAt = finishedAt || null;
    }

    validate() {
        if (!this.userId || !this.testId) {
            throw new Error('userId and testId are required');
        }
        if (typeof this.score !== 'number' || this.score < 0) {
            throw new Error('Score must be a non-negative number');
        }
        const validStatuses = ['not-started', 'completed'];
        if (!validStatuses.includes(this.status)) {
            throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }
}

module.exports({ CreateResult });
// patterns/QuestionFactory.js

/**
 * Base class.
 */
class BaseQuestionProduct {
    constructor(data) {
        this.data = data;
    }

    validate() {
        if (!this.data.content) throw new Error("Nội dung câu hỏi không được để trống");
        if (!this.data.options) throw new Error("Các lựa chọn không được để trống");
        if (!this.data.answer) throw new Error("Đáp án không được để trống");
    }

    getData() {
        return this.data;
    }
}

/**
 * Question with single choice.
 */
class SingleChoiceQuestion extends BaseQuestionProduct {
    validate() {
        super.validate();
        // Logic riêng: Đáp án phải là 1 String và nằm trong options
        if (typeof this.data.answer !== 'string') {
            throw new Error("Single Choice: Đáp án phải là một chuỗi ký tự.");
        }
        // Giả sử options là mảng string ['A', 'B', 'C']
        if (Array.isArray(this.data.options) && !this.data.options.includes(this.data.answer)) {
            throw new Error("Single Choice: Đáp án không nằm trong danh sách lựa chọn.");
        }
    }
}

/**
 * Question with multi choice.
 */
class MultipleSelectQuestion extends BaseQuestionProduct {
    validate() {
        super.validate();
        if (!Array.isArray(this.data.answer)) {
            throw new Error("Multiple Select: Đáp án phải là một danh sách (mảng).");
        }
        if (this.data.answer.length < 1) {
            throw new Error("Multiple Select: Phải có ít nhất 1 đáp án đúng.");
        }
    }
}

/**
 * FACTORY CLASS
 */
class QuestionFactory {
    static createQuestion(data) {
        switch (data.type) {
            case 'SINGLE_CHOICE':
                return new SingleChoiceQuestion(data);
            case 'MULTIPLE_SELECT':
                return new MultipleSelectQuestion(data);
            default:
                // Default is SINGLE_CHOICE to match with old data.
                return new SingleChoiceQuestion({ ...data, type: 'SINGLE_CHOICE' });
        }
    }
}

module.exports = QuestionFactory;
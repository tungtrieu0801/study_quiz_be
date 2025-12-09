const Groq = require("groq-sdk");
const AppError = require("../utils/AppError");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate AI Text as strict JSON
 * @param {string} prompt - yêu cầu tạo câu hỏi
 * @param {number} count - số lượng câu hỏi (default: 10)
 */
exports.generateAIText = async (prompt, count = 10) => {
    if (!prompt) throw new AppError("prompt is required", 400);

    // Nếu user không truyền hoặc truyền linh tinh → mặc định 10
    if (![10, 15, 20].includes(count)) {
        count = 10;
    }

    const strictPrompt = `
        Bạn phải luôn trả về DUY NHẤT JSON hợp lệ.
        KHÔNG dùng markdown.
        KHÔNG dùng code block.
        Không được escape ký tự hoặc dùng dấu \\.

        Trả về một mảng JSON gồm đúng ${count} câu hỏi.

        Mỗi object phải có đúng cấu trúc sau:

        {
          "content": "string",              
          "options": ["A", "B", "C", "D"],  
          "answer": "A",                   
          "solution": "string"              
        }

        Quy tắc:
        - Toàn bộ nội dung phải bằng tiếng Việt.
        - Câu hỏi loại SINGLE_CHOICE.
        - Không thêm bất kỳ trường nào khác.
        - Đáp án phải khớp 1 trong các option.
        - "solution" phải giải thích chi tiết tại sao đáp án đúng.

        Hãy tạo ${count} câu hỏi dựa trên yêu cầu sau:
        ${prompt}
    `;

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: "Return ONLY valid JSON. No markdown." },
                { role: "user", content: strictPrompt }
            ],
            temperature: 0.4,
            max_tokens: 3000,
        });

        let parsed = JSON.parse(completion.choices[0].message.content);

        return parsed;

    } catch (err) {
        console.error("Groq API error:", err);
        throw new AppError("AI generation failed", 500);
    }
};

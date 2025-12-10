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
        Bạn phải luôn trả về DUY NHẤT một JSON hợp lệ.
        KHÔNG dùng markdown.
        KHÔNG dùng code block.
        KHÔNG escape ký tự hoặc dùng dấu \\.
        
        Kết quả trả về phải là một mảng JSON gồm đúng ${count} phần tử.
        
        Mỗi phần tử phải là một object với cấu trúc CHÍNH XÁC như sau (không được thêm hoặc bớt trường):
        {
          "content": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string",
          "solution": "string"
        }
        
        YÊU CẦU BẮT BUỘC:
        1. Tất cả nội dung phải bằng tiếng Việt.
        2. Loại câu hỏi: SINGLE_CHOICE.
        3. Mỗi câu hỏi phải có 4 đáp án, mỗi đáp án PHẢI là một chuỗi có nội dung thực sự (không được để trống, không được đặt 'A', 'B'… mà không có nội dung).
        4. Đáp án đúng ("answer") PHẢI trùng 100% với một trong các chuỗi trong mảng "options".
        5. "solution" phải giải thích rõ ràng, chi tiết tại sao đáp án đó đúng.
        6. Không được tạo câu hỏi hoặc đáp án mơ hồ, không hợp lý hoặc không liên quan.
        7. Không sinh bất kỳ ký tự thừa, xuống dòng thừa, dấu phẩy sai JSON hoặc nội dung ngoài JSON.
        
        Nếu bạn không thể tuân thủ bất kỳ yêu cầu nào ở trên, bạn phải tự sửa và tạo lại cho đến khi JSON hợp lệ tuyệt đối.
        
        Bây giờ, hãy tạo chính xác ${count} câu hỏi dựa trên yêu cầu sau:
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

const Groq = require("groq-sdk");
const AppError = require("../utils/AppError");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate AI Text as strict JSON
 * @param {string} prompt
 */
exports.generateAIText = async (prompt) => {
    if (!prompt) {
        throw new AppError("prompt is required", 400);
    }

    const strictPrompt = `
        You must ALWAYS return ONLY valid JSON.
        Do NOT include markdown.
        Do NOT include code fences.
        Do NOT escape apostrophes or quotation marks.
        Output MUST be a pure JSON array of 10 questions.
        
        Each item MUST follow:
        {
          "question": "string",
          "options": {
            "A": "string",
            "B": "string",
            "C": "string",
            "D": "string"
          },
          "answer": "A" | "B" | "C" | "D"
        }
        
        Generate 10 questions based on this request:
        ${prompt}
        `;
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{role: "system", content: "Return ONLY valid JSON with no markdown."}, {
                role: "user",
                content: strictPrompt
            },],
            temperature: 0.4,
            max_tokens: 2000,
        });

        // Parse JSON returned from API
        let parsed = JSON.parse(completion.choices[0].message.content);

        // Clean escape characters (backslash) if AI still added them
        parsed = parsed.map(q => {
            q.question = q.question.replace(/\\'/g, "'");
            for (let key in q.options) {
                q.options[key] = q.options[key].replace(/\\'/g, "'");
            }
            return q;
        });

        return parsed;

    } catch (err) {
        console.error("Groq API error:", err);
        throw new AppError("AI generation failed", 500);
    }
};

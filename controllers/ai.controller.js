const aiService = require("../services/ai.service");

exports.generate = async (req, res, next) => {
    try {
        const { prompt } = req.body;

        const output = await aiService.generateAIText(prompt);

        res.json({
            success: true,
            message: "AI generated successfully",
            data: output
        });

    } catch (err) {
        next(err); // giống auth: cho middleware xử lý lỗi
    }
};

const aiService = require("../services/ai.service");

exports.generate = async (req, res, next) => {
    try {
        const { prompt, count } = req.body;

        const output = await aiService.generateAIText(prompt, count);

        res.json({
            success: true,
            message: "AI generated successfully",
            data: output
        });

    } catch (err) {
        next(err);
    }
};

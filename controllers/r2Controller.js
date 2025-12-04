const uploadService = require("../services/r2");

exports.uploadSingle = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const result = await uploadService.uploadToR2(req.file);

        res.json({
            success: true,
            message: "Upload thành công",
            data: result
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

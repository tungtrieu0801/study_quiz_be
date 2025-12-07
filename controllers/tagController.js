const tagService = require('../services/tagService');
const { CreateTagDto } = require('../dtos/tag/CreateTagDto');
const { UpdateTagDto } = require("../dtos/tag/UpdateTagDto");

exports.createTag = async (req, res) => {
    try {
        const tagDto = new CreateTagDto(req.body);
        const userInformation = req.user;

        const tag = await tagService.createTag(tagDto, userInformation);

        if (tag.error) {
            return res.status(400).json({ success: false, message: tag.error });
        }
        res.status(201).json({
            success: true,
            message: 'Tag created successfully',
            data: tag
        });
    } catch (err) {
        const status = err.message.includes('Only admins') ? 403 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
}

exports.getAllTags = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const tagName = req.query.tagName;
        const userInformation = req.user;
        const result = await tagService.getAllTags(page, size, tagName, userInformation);

        res.json({
            success: true, // Thống nhất dùng success: true/false
            message: "Get All Tags successfully",
            data: result.tagList,
            total: result.total,
            page,
            size
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.updateTag = async (req, res) => {
    try {
        const id = req.params.id;
        // Nếu chưa có file UpdateTagDto, bạn có thể dùng tạm CreateTagDto hoặc req.body trực tiếp
        const dto = new UpdateTagDto(req.body);
        const userInformation = req.user;

        const updated = await tagService.updateTag(id, dto, userInformation);

        if (updated.error) {
            return res.status(400).json({ success: false, message: updated.error });
        }

        res.json({
            success: true,
            message: "Tag updated successfully",
            data: updated
        });
    } catch (err) {
        const status = err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await tagService.deleteTag(id);

        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }

        res.json({
            success: true,
            message: "Tag deleted successfully"
        });
    } catch (err) {
        const status = err.message.includes('not found') ? 404 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};
const tagService = require('../services/tagService');
const CreateTagDto = require('../dtos/tag/CreateTagDto');
const UpdateTagDto = require("../dtos/tag/UpdateTagDto");

exports.createTag = async (req, res) => {
    const tagDto = new CreateTagDto(req.body);
    const userInformation = req.user;
    try {
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
    const userInformation = req.user;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const tagName = req.query.tagName;
    try {
        const tags = await tagService.getAllTags(page, size, tagName);
        res.json({
            status: "success",
            message: "Get All Tags successfully",
            data: tags
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.updateTag = async (req, res) => {
    const id = req.params.id;
    const dto = new UpdateTagDto(req.body);
    const userInformation = req.user;

    try {
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
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTag = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await tagService.deleteTag(id);

        if (result.error) {
            return res.status(400).json({ success: false, message: result.error });
        }

        res.json({
            success: true,
            message: "Tag deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

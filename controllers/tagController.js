const tagService = require('../services/tagService');
const CreateTagDto = require('../dtos/tag/CreateTagDto');

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
    try {
        const tags = await tagService.getAllTags();
        res.json({
            success: true,
            data: tags
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

exports.deleteTag = async (req, res) => {
    try {
        const tagId = req.params.id;
        const result = await tagService.deleteTag(tagId);
        if (result.error) {
            return res.status(404).json({ success: false, message: result.error });
        }
        res.json({
            success: true,
            message: 'Tag deleted successfully',
            data: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
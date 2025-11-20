const Tag = require('../models/Tag');
const Question = require('../models/Question');
const { CreateTagDto } = require('../dtos/tag/CreateTagDto');
/**
 *
 * @param {CreateTagDto} dto
 * @param userInformation include userId and role
 *
 */
exports.createTag = async (dto, userInformation) => {
    dto.validate();
    const tagExists = await Tag.findOne({ name: dto.name });
    if (tagExists) return { error: 'Tag name already exists' };

    const tag = new Tag(dto);
    await tag.save();
    return tag;
};

exports.getAllTags = async ({ page = 1, size = 10 } = {}) => {
    const skip = (page - 1) * size;
    const tags = await Tag.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(size);

    const total = await Tag.countDocuments();

    return {
        data: tags,
        message: 'Tags retrieved successfully',
        page,
        size,
        total,
        totalPages: Math.ceil(total / size),
    };
};

exports.deleteTag = async (id) => {
    await Question.updateMany(
        { tags: id},
        { $pull: {tags: id} }
    )
    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) return { error: 'Tag not found' };
    return tag;
}
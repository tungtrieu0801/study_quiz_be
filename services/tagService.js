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

exports.getAllTags = async (page, size, tagName ) => {
    const filter = {};
    if (tagName !== undefined && tagName.trim() !== "") {
        filter.name = tagName.trim();
    }

    const tagList = await Tag.find(filter)
        .skip(page * size)
        .limit(size)
        .sort({ updatedAt: -1 });
    const total = await Tag.countDocuments(filter);

    return {
        tagList,
        total,
    };
};

exports.updateTag = async (id, dto, userInformation) => {
    dto.validate();

    const existingTag = await Tag.findById(id);
    if (!existingTag) {
        throw new Error("Tag not found");
    }

    // Kiểm tra trùng tên (nhưng bỏ qua chính nó)
    const nameExists = await Tag.findOne({ name: dto.name, _id: { $ne: id } });
    if (nameExists) {
        return { error: "Tag name already exists" };
    }

    existingTag.name = dto.name;
    existingTag.description = dto.description;

    await existingTag.save();

    return existingTag;
};

exports.deleteTag = async (id) => {
    const tag = await Tag.findById(id);
    if (!tag) {
        throw new Error("Tag not found");
    }

    // Optional: Check nếu tag đang gắn cho câu hỏi
    const isUsed = await Question.findOne({ tags: id });
    if (isUsed) {
        return { error: "Tag is being used in questions" };
    }

    await Tag.findByIdAndDelete(id);

    return { success: true };
};


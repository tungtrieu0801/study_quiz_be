const Tag = require('../models/Tag');
const Question = require('../models/Question');

exports.createTag = async (dto, userInformation) => {
    // Validate dữ liệu
    if (dto.validate) dto.validate();

    // Check trùng tên
    const tagExists = await Tag.findOne({ name: dto.name });
    if (tagExists) return { error: 'Tag name already exists' };

    const tag = new Tag({
        name: dto.name,
        description: dto.description
    });

    await tag.save();
    return tag;
};

exports.getAllTags = async (page, size, tagName) => {
    const filter = {};
    // Tìm kiếm gần đúng (Regex) cho tiện dụng, hoặc tìm chính xác tùy bạn
    if (tagName !== undefined && tagName.trim() !== "") {
        // Sử dụng regex để tìm kiếm không phân biệt hoa thường và tìm gần đúng
        filter.name = { $regex: tagName.trim(), $options: 'i' };
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
    if (dto.validate) dto.validate();

    const existingTag = await Tag.findById(id);
    if (!existingTag) {
        throw new Error("Tag not found");
    }

    // Kiểm tra trùng tên (nhưng bỏ qua chính nó)
    const nameExists = await Tag.findOne({ name: dto.name, _id: { $ne: id } });
    if (nameExists) {
        return { error: "Tag name already exists" };
    }

    // Cập nhật dữ liệu
    existingTag.name = dto.name;
    existingTag.description = dto.description;
    existingTag.updatedAt = new Date();

    await existingTag.save();

    return existingTag;
};

/**
 * Xóa Tag và gỡ Tag ID khỏi tất cả câu hỏi liên quan
 */
exports.deleteTag = async (id) => {
    const tag = await Tag.findById(id);
    if (!tag) {
        throw new Error("Tag not found");
    }

    // 1. Gỡ Tag ID này ra khỏi tất cả các câu hỏi đang chứa nó
    // Sử dụng $pull để xóa phần tử id khỏi mảng tags trong collection Question
    await Question.updateMany(
        { tags: id },
        { $pull: { tags: id } }
    );

    // 2. Xóa Tag
    await Tag.findByIdAndDelete(id);

    return { success: true };
};
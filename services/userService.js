const User = require('../models/User');

exports.updateUser = async (dto) => {

    try {
        const userUpdated = new User({
            fullName: dto.fullName,
            gradeLevel: dto.gradeLevel,
        })

        await userUpdated.save();
        return userUpdated;
    } catch (e) {
        return { error: "Cannot update user" };
    }
}
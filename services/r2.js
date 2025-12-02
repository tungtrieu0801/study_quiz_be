const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getR2Client } = require("../config/r2"); // dùng client đã init

exports.uploadToR2 = async (file) => {
    if (!file) throw new Error("No file uploaded");

    // Lấy client đã khởi tạo
    const r2 = getR2Client();
    if (!r2) throw new Error("R2 client chưa được khởi tạo");

    const fileName = `uploads/${Date.now()}_${file.originalname}`;

    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await r2.send(new PutObjectCommand(params));

    // URL public
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

    return { fileName, url: publicUrl };
};

const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

let r2Client;

const initR2 = async () => {
    r2Client = new S3Client({
        region: "auto",
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY,
            secretAccessKey: process.env.R2_SECRET_KEY,
        },
    });

    try {
        // Thử gọi lệnh ListBuckets để kiểm tra kết nối
        await r2Client.send(new ListBucketsCommand({}));
        console.log("✅ Cloudflare R2 initialized and connected");
    } catch (err) {
        console.error("❌ Cloudflare R2 connection error:", err);
        process.exit(1);
    }

    return r2Client;
};

module.exports = { initR2, getR2Client: () => r2Client };

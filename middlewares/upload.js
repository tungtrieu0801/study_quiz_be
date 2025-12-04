import multer from "multer";

// Lưu file vào RAM → upload buffer lên R2
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // tối đa 20MB
    },
});

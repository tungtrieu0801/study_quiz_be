const express = require('express');
const router = express.Router();
const multer = require("multer");
const {uploadSingle} = require("../controllers/r2Controller");

// chỉ dùng memoryStorage → không lưu file xuống disk
const upload = multer({ storage: multer.memoryStorage() });

router.post("/single", upload.single("file"), uploadSingle);

module.exports = router;

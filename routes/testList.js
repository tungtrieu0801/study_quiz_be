const express = require('express');
const router = express.Router();
const {createTest, getListTests, deleteTest, updateTest, getTestDetail, getTestStatistics} = require("../controllers/testListController");

router.post('/', createTest);

// 2. Lấy danh sách bài thi
router.get('/', getListTests);

// --- CÁC ROUTE MỚI BỔ SUNG ---

// 3. Lấy chi tiết bài thi (Fix lỗi 404 khi vào trang quản lý)
router.get('/:id', getTestDetail);

// 4. Cập nhật bài thi (Sửa tên, thêm/bớt câu hỏi...)
router.put('/:id', updateTest);

// 5. Xóa bài thi
router.delete('/:id', deleteTest);

router.get('/:id/statistics', getTestStatistics);
module.exports = router;
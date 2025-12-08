const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    submitTest,
    getQuestionsByIds
} = require('../controllers/questionController');
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// Router for create quesion
router.post('/', upload.single("file"), createQuestion);

// Router for get list question
router.get('/', getQuestions);

// Router for update quesion by id
router.put('/:id', upload.single('file'), updateQuestion);

// Router for delete quesion by id
router.delete('/:id', deleteQuestion);

// Router for submit exam
router.post('/submit', submitTest);

// Get list question by list id (for view result detail question in exam)
router.post('/get-by-ids', getQuestionsByIds);
module.exports = router;
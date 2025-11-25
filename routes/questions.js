const express = require('express');
const router = express.Router();
const { createQuestion, getQuestions, updateQuestion, deleteQuestion, submitTest} = require('../controllers/questionController');

router.post('/', createQuestion);
router.get('/', getQuestions);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.post('/submit', submitTest);
module.exports = router;
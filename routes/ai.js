const express = require('express');
const router = express.Router();
const { generate } = require('../controllers/ai.controller')

router.post("/generate", generate);

module.exports = router;

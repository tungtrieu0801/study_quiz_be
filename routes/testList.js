const express = require('express');
const router = express.Router();
const {createTest, getListTests} = require("../controllers/testListController");

router.post('/', createTest);
router.get('/', getListTests);

module.exports = router;
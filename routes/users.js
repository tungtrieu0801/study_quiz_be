const express = require('express');
const router = express.Router();
const { updateUser, getStudents} = require('../controllers/userController');

router.get('/', getStudents);
router.put('/', updateUser);

module.exports = router;

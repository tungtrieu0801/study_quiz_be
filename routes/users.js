const express = require('express');
const router = express.Router();
const { updateUser } = require('../controllers/userController');

router.post('/', updateUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { updateUser } = require('../controllers/userController');

router.put('/', updateUser);

module.exports = router;

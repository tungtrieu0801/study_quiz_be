const express = require('express');
const router = express.Router();
const { register, login, bulkRegister, updateRole } = require('../controllers/authController');

router.post('/update-role', updateRole);
router.post('/bulk-register', bulkRegister);
router.post('/register', register);
router.post('/login', login);

module.exports = router;

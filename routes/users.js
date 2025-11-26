const express = require('express');
const router = express.Router();
const { updateUser, getStudents, migrateFirstNames} = require('../controllers/userController');

router.get('/', getStudents);
router.put('/', updateUser);
router.post('/migrate-names', migrateFirstNames);
module.exports = router;

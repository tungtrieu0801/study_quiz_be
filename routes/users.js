const express = require('express');
const router = express.Router();
const { updateUser, getListUser, migrateFirstNames} = require('../controllers/userController');

router.get('/', getListUser);
router.put('/', updateUser);
router.post('/migrate-names', migrateFirstNames);
module.exports = router;

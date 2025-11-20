const express = require('express');
const router = express.Router();
const { createTag, getAllTags, deleteTag } = require('../controllers/tagController');

// Create a new tag
router.post('/', createTag);

// Get all tags
router.get('/', getAllTags);

// Delete a tag by ID
router.delete('/:id', deleteTag);

module.exports = router;
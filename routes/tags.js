const express = require('express');
const router = express.Router();
const { createTag, getAllTags, deleteTag, updateTag } = require('../controllers/tagController');

// Create a new tag
router.post('/', createTag);

// Get all tags
router.get('/', getAllTags);

// Update tag
router.put('/:id', updateTag);

// Delete tag
router.delete('/:id', deleteTag);

module.exports = router;

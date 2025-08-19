// src/routes/characters.js
const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');

// Get all characters with pagination
router.get('/', characterController.getCharacters);

// Search characters by name
router.get('/search', characterController.searchCharacters);

// Get character by ID
router.get('/:id', characterController.getCharacter);

module.exports = router;
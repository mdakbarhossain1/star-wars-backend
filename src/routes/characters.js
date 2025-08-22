const express = require("express");
const router = express.Router();
const characterController = require("../controllers/characterController");

// Get all characters with pagination
router.get("/", characterController.getCharacters);

// Search characters by name - FIXED: Make sure this comes before :id route
router.get("/search", characterController.searchCharacters); // http://star-wars-backend-iota.vercel.app/api/characters/search?name=Luke

// Get character by ID
router.get("/:id", characterController.getCharacter);

module.exports = router;

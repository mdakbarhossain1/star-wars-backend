// src/controllers/characterController.js
const swapiService = require("../services/swapiService");
const { ApiError } = require("../utils/errors");

class CharacterController {
  // Get paginated list of characters
  getCharacters = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        return next(new ApiError("Invalid pagination parameters", 400));
      }

      const data = await swapiService.getCharacters(page, limit);

      if (!data || !data.results) {
        return next(new ApiError("Failed to fetch characters", 502));
      }

      res.json({
        data: data.results,
        total: data.total_records || data.count || data.results.length,
        page,
        limit,
        totalPages: Math.ceil(
          (data.total_records || data.count || data.results.length) / limit
        ),
      });
    } catch (error) {
      next(error);
    }
  };

  // Search characters by name
  // Search characters by name
  searchCharacters = async (req, res, next) => {
    try {
      const searchTerm = (
        req.query.name ||
        req.query.q ||
        req.query.search ||
        ""
      ).trim();

      if (!searchTerm || searchTerm.length < 2) {
        return next(
          new ApiError("Search term must be at least 2 characters long", 400)
        );
      }

      // Attempt to fetch characters by search term
      const data = await swapiService.searchCharacters(searchTerm);

      if (data && data.results && data.results.length > 0) {
        // Enhance and return the found characters
        const enhancedResults = await Promise.all(
          data.results.map((item) => swapiService.getCharacterById(item.uid))
        );
        res.json({
          data: enhancedResults,
          total: enhancedResults.length,
          searchTerm,
        });
      } else {
        // Fallback: Fetch all characters and filter them
        const allCharacters = await swapiService.getAllCharacters();
        const filteredCharacters = allCharacters.filter((character) =>
          character.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredCharacters.length === 0) {
          return next(new ApiError("No characters found", 404));
        }

        // Enhance and return the filtered characters
        const enhancedResults = await Promise.all(
          filteredCharacters.map((item) =>
            swapiService.getCharacterById(item.uid)
          )
        );
        res.json({
          data: enhancedResults,
          total: enhancedResults.length,
          searchTerm,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Get character by ID with expanded details
  getCharacter = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id || isNaN(parseInt(id))) {
        throw new ApiError("Invalid character ID", 400);
      }

      const characterData = await swapiService.getCharacterById(id);

      if (!characterData || !characterData.result) {
        throw new ApiError("Character not found", 404);
      }

      const enhancedCharacter = await this.enhanceCharacterDetails(
        characterData.result
      );
      res.json(enhancedCharacter);
    } catch (error) {
      next(error);
    }
  };

  // Enhance character details with additional information
  enhanceCharacterDetails = async (character) => {
    const { properties } = character || {};
    if (!properties) return character;

    const enhancedProperties = { ...properties };

    const enrichResourceArray = async (urls, label) => {
      if (!urls || urls.length === 0) return;
      try {
        const data = await swapiService.getResources(urls);
        enhancedProperties[label] = data.map((d) => d.result.properties);
      } catch (error) {
        console.error(`Error fetching ${label}:`, error.message);
        enhancedProperties[label] = [{ error: `Failed to load ${label}` }];
      }
    };

    // Homeworld
    if (properties.homeworld) {
      try {
        const homeworldData = await swapiService.getResource(
          properties.homeworld
        );
        enhancedProperties.homeworld = homeworldData?.result?.properties || {};
      } catch (error) {
        console.error("Error fetching homeworld:", error.message);
        enhancedProperties.homeworld = {
          error: "Failed to load homeworld details",
        };
      }
    }

    // Other related resources
    await enrichResourceArray(properties.films, "films");
    await enrichResourceArray(properties.species, "species");
    await enrichResourceArray(properties.vehicles, "vehicles");
    await enrichResourceArray(properties.starships, "starships");

    return {
      ...character,
      properties: enhancedProperties,
    };
  };
}

module.exports = new CharacterController();

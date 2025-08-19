// src/controllers/characterController.js

import swapiService from "../services/swapiService"
import {ApiError} from "../utils/errors"

class CharacterController {
  // Get paginated list of characters
  async getCharacters(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError('Invalid pagination parameters', 400);
      }

      const data = await swapiService.getCharacters(page, limit);
      res.json({
        data: data.results,
        total: data.total_records,
        page,
        limit,
        totalPages: Math.ceil(data.total_records / limit)
      });
    } catch (error) {
      next(error);
    }
  }

  // Search characters by name
  async searchCharacters(req, res, next) {
    try {
      const { q: searchTerm } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new ApiError('Search term must be at least 2 characters long', 400);
      }

      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError('Invalid pagination parameters', 400);
      }

      const data = await swapiService.searchCharacters(searchTerm, page, limit);
      res.json({
        data: data.results,
        total: data.total_records,
        page,
        limit,
        totalPages: Math.ceil(data.total_records / limit),
        searchTerm
      });
    } catch (error) {
      next(error);
    }
  }

  // Get character by ID with expanded details
  async getCharacter(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        throw new ApiError('Invalid character ID', 400);
      }

      const characterData = await swapiService.getCharacterById(id);
      
      if (!characterData || !characterData.result) {
        throw new ApiError('Character not found', 404);
      }

      const character = characterData.result;
      
      // Enhance character data with additional details
      const enhancedCharacter = await this.enhanceCharacterDetails(character);
      
      res.json(enhancedCharacter);
    } catch (error) {
      next(error);
    }
  }

  // Enhance character details with additional information
  async enhanceCharacterDetails(character) {
    const { properties } = character;
    const enhancedProperties = { ...properties };
    
    // Get homeworld details if available
    if (properties.homeworld) {
      try {
        const homeworldData = await swapiService.getResource(properties.homeworld);
        enhancedProperties.homeworld = homeworldData.result.properties;
      } catch (error) {
        console.error('Error fetching homeworld:', error.message);
        enhancedProperties.homeworld = { error: 'Failed to load homeworld details' };
      }
    }
    
    // Get films details if available
    if (properties.films && properties.films.length > 0) {
      try {
        const filmsData = await swapiService.getResources(properties.films);
        enhancedProperties.films = filmsData.map(film => film.result.properties);
      } catch (error) {
        console.error('Error fetching films:', error.message);
        enhancedProperties.films = [{ error: 'Failed to load film details' }];
      }
    }
    
    // Get species details if available
    if (properties.species && properties.species.length > 0) {
      try {
        const speciesData = await swapiService.getResources(properties.species);
        enhancedProperties.species = speciesData.map(species => species.result.properties);
      } catch (error) {
        console.error('Error fetching species:', error.message);
        enhancedProperties.species = [{ error: 'Failed to load species details' }];
      }
    }
    
    // Get vehicles details if available
    if (properties.vehicles && properties.vehicles.length > 0) {
      try {
        const vehiclesData = await swapiService.getResources(properties.vehicles);
        enhancedProperties.vehicles = vehiclesData.map(vehicle => vehicle.result.properties);
      } catch (error) {
        console.error('Error fetching vehicles:', error.message);
        enhancedProperties.vehicles = [{ error: 'Failed to load vehicle details' }];
      }
    }
    
    // Get starships details if available
    if (properties.starships && properties.starships.length > 0) {
      try {
        const starshipsData = await swapiService.getResources(properties.starships);
        enhancedProperties.starships = starshipsData.map(starship => starship.result.properties);
      } catch (error) {
        console.error('Error fetching starships:', error.message);
        enhancedProperties.starships = [{ error: 'Failed to load starship details' }];
      }
    }
    
    return {
      ...character,
      properties: enhancedProperties
    };
  }
}

module.exports = new CharacterController();
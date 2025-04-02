
import { v4 as uuidv4 } from 'uuid';
import { getSmartImage } from './image-helpers';
import type { Place } from './types';

/**
 * Get all user places from localStorage
 */
export const getUserPlaces = (): Place[] => {
  try {
    const placesJSON = localStorage.getItem('userPlaces');
    if (!placesJSON) return [];
    
    const places = JSON.parse(placesJSON);
    return Array.isArray(places) ? places : [];
  } catch (error) {
    console.error('Error getting user places:', error);
    return [];
  }
};

/**
 * Add a place to user places in localStorage
 */
export const addToUserPlaces = (cityName: string, country?: string): void => {
  try {
    const places = getUserPlaces();
    
    // Check if place already exists by name (case insensitive)
    const existingPlace = places.find(
      p => p.name.toLowerCase() === cityName.toLowerCase()
    );
    
    if (existingPlace) {
      // Update existing place with country if provided and not already set
      if (country && !existingPlace.country) {
        existingPlace.country = country;
        localStorage.setItem('userPlaces', JSON.stringify(places));
      }
      return;
    }
    
    // Add new place
    const newPlace: Place = {
      id: uuidv4(),
      name: cityName,
      image: getSmartImage(cityName, 'location'),
      ...(country && { country })
    };
    
    places.push(newPlace);
    localStorage.setItem('userPlaces', JSON.stringify(places));
  } catch (error) {
    console.error('Error adding place to user places:', error);
  }
};

/**
 * Delete a place by id from localStorage
 */
export const deletePlaceById = (placeId: string): void => {
  try {
    const places = getUserPlaces();
    const updatedPlaces = places.filter(p => p.id !== placeId);
    localStorage.setItem('userPlaces', JSON.stringify(updatedPlaces));
  } catch (error) {
    console.error('Error deleting place:', error);
    throw error;
  }
};

/**
 * Update a place's image in localStorage
 */
export const updatePlaceImage = (placeId: string, imageUrl: string): void => {
  try {
    const places = getUserPlaces();
    const updatedPlaces = places.map(place => 
      place.id === placeId 
        ? { ...place, image: imageUrl } 
        : place
    );
    
    localStorage.setItem('userPlaces', JSON.stringify(updatedPlaces));
  } catch (error) {
    console.error('Error updating place image:', error);
    throw error;
  }
};

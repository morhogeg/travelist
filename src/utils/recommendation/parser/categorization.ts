
import { RecommendationPlace } from '../types';

/**
 * Apply intelligent categorization based on context clues
 */
export function applyCategoryIntelligence(places: RecommendationPlace[]): RecommendationPlace[] {
  return places.map(place => {
    const lowerName = place.name.toLowerCase();
    let category = place.category;
    let name = place.name;
    
    // Detect restaurant patterns ("eat at", "eat in", "restaurant", etc.)
    if (
      (lowerName.includes('eat at ') || lowerName.includes('eat in ') || 
       lowerName.includes('dining at ') || lowerName.includes('dine at ') ||
       lowerName.includes('restaurant')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Food';
      
      // Extract the actual restaurant name
      if (lowerName.includes('eat at ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('eat at ') + 7).trim();
      } else if (lowerName.includes('eat in ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('eat in ') + 7).trim();
      } else if (lowerName.includes('dining at ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('dining at ') + 10).trim();
      } else if (lowerName.includes('dine at ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('dine at ') + 8).trim();
      }
      
      // Capitalize first letter of each word in restaurant name
      name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    // Coffee shop patterns
    if (
      (lowerName.includes('coffee') || lowerName.includes('café') || 
       lowerName.includes('cafe')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Coffee';
    }
    
    // Attractions patterns
    if (
      (lowerName.includes('visit ') || lowerName.includes('see ') || 
       lowerName.includes('museum') || lowerName.includes('gallery') || 
       lowerName.includes('monument') || lowerName.includes('landmark')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Attractions';
      
      // Extract the actual attraction name if prefixed with "visit" or "see"
      if (lowerName.includes('visit ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('visit ') + 6).trim();
      } else if (lowerName.includes('see ')) {
        name = place.name.substring(place.name.toLowerCase().indexOf('see ') + 4).trim();
      }
    }
    
    // Hotels/accommodation patterns
    if (
      (lowerName.includes('hotel') || lowerName.includes('stay at ') || 
       lowerName.includes('hostel') || lowerName.includes('inn') ||
       lowerName.includes('motel') || lowerName.includes('lodge')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Accommodation';
    }
    
    // Nightlife patterns
    if (
      (lowerName.includes('bar') || lowerName.includes('club') || 
       lowerName.includes('pub') || lowerName.includes('lounge')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Nightlife';
    }
    
    // Shopping patterns
    if (
      (lowerName.includes('shop') || lowerName.includes('mall') || 
       lowerName.includes('market') || lowerName.includes('store')) && 
      category.toLowerCase() === 'general'
    ) {
      category = 'Shopping';
    }
    
    return {
      ...place,
      name,
      category
    };
  });
}

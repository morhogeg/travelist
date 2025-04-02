
import { v4 as uuidv4 } from 'uuid';
import { RecommendationPlace } from '../types';
import { capitalizeFirstLetter } from './helpers';

/**
 * Attempt to extract places from a structured format like:
 * Category: Place, Place
 * Another Category: Place, Place
 */
export function extractStructuredPlaces(text: string) {
  const places = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Check if line has a category format: "Category: Places"
    const match = line.match(/^([^:]+):\s*(.+)$/);
    
    if (match) {
      const category = capitalizeFirstLetter(match[1].trim());
      const placesText = match[2].trim();
      
      // Split places by comma or semicolon
      const placeNames = placesText.split(/[,;]/).filter(Boolean);
      
      for (const rawName of placeNames) {
        // Extract name and potential description within parentheses
        let name = rawName.trim();
        let description = '';
        let website = '';
        
        // Check for website in square brackets [https://example.com]
        const websiteMatch = name.match(/\[(https?:\/\/[^\]]+)\]/);
        if (websiteMatch) {
          website = websiteMatch[1];
          name = name.replace(/\[https?:\/\/[^\]]+\]/, '').trim();
        }
        
        // Check for description in parentheses
        const descMatch = name.match(/\(([^)]+)\)/);
        if (descMatch) {
          description = descMatch[1];
          name = name.replace(/\([^)]+\)/, '').trim();
        }
        
        places.push({
          id: uuidv4(),
          name,
          category,
          description: description || undefined,
          website: website || undefined
        });
      }
    }
  }
  
  return places;
}

/**
 * Extract places from a line-by-line format where each line is a place
 */
export function extractLineBasedPlaces(text: string) {
  const places = [];
  const lines = text.split('\n');
  
  // Default category if none is specified
  const defaultCategory = 'General';
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    let name = line.trim();
    let category = defaultCategory;
    let description = '';
    let website = '';
    
    // Try to extract category in hashtag format: Place #Category
    const hashtagMatch = name.match(/#([a-zA-Z0-9]+)/);
    if (hashtagMatch) {
      category = capitalizeFirstLetter(hashtagMatch[1]);
      name = name.replace(/#[a-zA-Z0-9]+/, '').trim();
    }
    
    // Check for website in square brackets [https://example.com]
    const websiteMatch = name.match(/\[(https?:\/\/[^\]]+)\]/);
    if (websiteMatch) {
      website = websiteMatch[1];
      name = name.replace(/\[https?:\/\/[^\]]+\]/, '').trim();
    }
    
    // Check for description in parentheses
    const descMatch = name.match(/\(([^)]+)\)/);
    if (descMatch) {
      description = descMatch[1];
      name = name.replace(/\([^)]+\)/, '').trim();
    }
    
    // Make sure we actually have a name
    if (name) {
      places.push({
        id: uuidv4(),
        name,
        category,
        description: description || undefined,
        website: website || undefined
      });
    }
  }
  
  return places;
}

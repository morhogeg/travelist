
/**
 * Utility functions for generating various links
 */

/**
 * Generates a Google Maps search link for a place
 * @param placeName The name of the specific place/recommendation
 * @param cityName The name of the city/location
 * @returns A URL string for Google Maps
 */
export function generateMapLink(placeName: string, cityName: string): string {
  const query = encodeURIComponent(`${placeName} in ${cityName}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Safely formats a URL by ensuring it has the correct protocol
 * @param url The URL to format
 * @returns A properly formatted URL string
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  
  // If the url starts with www. or domain name directly
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

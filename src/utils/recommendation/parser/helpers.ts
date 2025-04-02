
/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(string: string): string {
  if (!string) return "General";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

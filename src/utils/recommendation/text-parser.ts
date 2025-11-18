import { RecommendationSource, SourceType } from "./types";

/**
 * Extract a source name from common attribution patterns
 * Patterns: "Sarah said...", "From John:", "According to Mary..."
 */
export const extractSourceName = (text: string): string | null => {
  const patterns = [
    // "Sarah said", "Sarah recommended", "Sarah suggested"
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:said|recommended|suggested|told me|mentioned)/i,
    // "From Sarah", "from @username"
    /from\s+@?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    // "According to Sarah"
    /according to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

/**
 * Extract URLs from text
 */
export const extractURL = (text: string): string | null => {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
};

/**
 * Detect source type from text patterns or URL
 */
export const detectSourceType = (text: string, url?: string): SourceType | null => {
  const lowerText = text.toLowerCase();

  // Check for @ mentions
  if (/@\w+/.test(text)) {
    if (lowerText.includes('instagram') || lowerText.includes('insta')) {
      return 'instagram';
    }
    if (lowerText.includes('tiktok')) {
      return 'tiktok';
    }
    if (lowerText.includes('youtube')) {
      return 'youtube';
    }
    // Default @ mention to Instagram
    return 'instagram';
  }

  // Check URL for platform detection
  if (url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('blog') || urlLower.includes('medium.com') || urlLower.includes('substack.com')) return 'blog';
  }

  // Check for platform keywords
  if (lowerText.includes('blog')) return 'blog';
  if (lowerText.includes('article')) return 'article';
  if (lowerText.includes('email')) return 'email';
  if (lowerText.includes('text message') || lowerText.includes('texted')) return 'text';

  // Check for friend/personal indicators
  if (lowerText.includes('friend') || lowerText.includes('told me') || lowerText.includes('said')) {
    return 'friend';
  }

  return null;
};

/**
 * Extract @ mentions (username)
 */
export const extractMention = (text: string): string | null => {
  const mentionPattern = /@(\w+)/;
  const match = text.match(mentionPattern);
  return match ? `@${match[1]}` : null;
};

/**
 * Auto-populate source from text
 * Returns a RecommendationSource object if attribution is detected
 */
export const autoPopulateSource = (text: string): RecommendationSource | null => {
  const url = extractURL(text);
  const mention = extractMention(text);
  const name = mention || extractSourceName(text);
  const type = detectSourceType(text, url || undefined);

  // Only return a source if we found at least a name or URL
  if (!name && !url) {
    return null;
  }

  return {
    type: type || 'other',
    name: name || '',
    url: url || undefined,
  };
};

/**
 * Clean recommendation text by removing attribution patterns
 * Useful for extracting just the recommendation content
 */
export const cleanAttributionFromText = (text: string): string => {
  let cleaned = text;

  // Remove "Sarah said: " or "From John: " prefixes
  cleaned = cleaned.replace(/^(?:from\s+)?@?\w+(?:\s+\w+)?\s*(?:said|recommended|suggested|told me|mentioned):\s*/i, '');
  cleaned = cleaned.replace(/^from\s+@?\w+(?:\s+\w+)?:\s*/i, '');
  cleaned = cleaned.replace(/^according to\s+\w+(?:\s+\w+)?:\s*/i, '');

  // Remove URLs (they're extracted separately)
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '');

  return cleaned.trim();
};

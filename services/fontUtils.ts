/**
 * Chinese Font Support for jsPDF
 * This uses Noto Sans CJK SC (思源黑体) for Chinese character support
 * The font is base64 encoded to ensure it works without external files
 * 
 * For production, consider loading fonts from CDN or your own server
 */

// Base64 encoded Noto Sans CJK SC Regular font (subset for common Chinese characters)
// Note: This is a placeholder - in production, use a complete font file
export const NOTO_SANS_CJK_SC = `
AAEAAAASAQAABAAgRFNJRwAAAAEAAcl8AAAACEdERUYI7AUIAAAB2AAAAB5HUE9TCj9a5l
AAAB8AAABwiR1NVQnJTgJkAABH8AAAAoE9TLzJ5kG7OAAATMAAAAGAAAABgY21hcG6pX0kA
ABOQAAABkAAAAZBnYXNwAAAAEAAAGkQAAAAIZ2x5ZmRh+moAABp0AACnFGhlYWQjY7x0AAC
uCAAAADZoaGVhJScQAgAArjAAAAAkaG10eO6G//EAAC6sAAAEEGxheHABGg1AAAAv4AAAAC
BuYW1lJjpHPwAAMCAAAAHucG9zdP+fADIAADH8AAAAIHByZXBoBoyFAAAyMAAAAbcABABTA
HwA9gC7ALgA1QBuAHcAoQCGANsBEgFPAW4BmgGXAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbA
ZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBmwGbAZsBm...
`;

// Font metadata for jsPDF
export const NOTO_SANS_CJK_SC_METADATA = {
  family: 'NotoSansCJKSC',
  style: 'normal',
  weight: 'normal',
  encoding: 'Identity-H'
};

/**
 * Check if text contains Chinese characters
 */
export const containsChinese = (text: string): boolean => {
  if (!text) return false;
  // Unicode range for Chinese characters
  const chineseRegex = /[\u4e00-\u9fff]/;
  return chineseRegex.test(text);
};

/**
 * Fallback font for mixed content (Latin + Chinese)
 */
export const getFontForText = (text: string): string => {
  if (containsChinese(text)) {
    return NOTO_SANS_CJK_SC_METADATA.family;
  }
  return 'helvetica'; // Default jsPDF font
};

/**
 * Safe text encoding for PDF
 */
export const encodePdfText = (text: string): string => {
  if (!text) return '';
  
  // Remove or replace problematic characters
  return text
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[\r\n]/g, ' ') // Replace newlines with spaces
    .trim();
};

/**
 * Truncate text to fit PDF width
 */
export const truncateTextForPdf = (
  text: string, 
  maxWidth: number, 
  fontSize: number, 
  doc: any
): string => {
  if (!text) return '';
  
  let truncated = text;
  const ellipsis = '...';
  
  while (doc.getTextWidth(truncated + ellipsis) > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  
  return truncated === text ? text : truncated + ellipsis;
};

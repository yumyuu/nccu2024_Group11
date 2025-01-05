/**
 * Extracts page number from filename
 * @param {string} filename - The filename to parse
 * @returns {number} The page number or Infinity if not found
 */
export function extractPageNumber(filename) {
    const match = filename.match(/page_(\d+)/i);
    return match ? parseInt(match[1], 10) : Infinity;
}

/**
 * Sorts files by page number in filename
 * @param {File[]} files - Array of files to sort
 * @returns {File[]} Sorted array of files
 */
export function sortFilesByPage(files) {
    return [...files].sort((a, b) => {
        const pageA = extractPageNumber(a.name);
        const pageB = extractPageNumber(b.name);
        return pageA - pageB;
    });
}
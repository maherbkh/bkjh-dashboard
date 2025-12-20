/**
 * Composable to convert setting keys to human-readable labels
 * 
 * Examples:
 * - "shared.company.address" → "Company Address"
 * - "academy.course.title" → "Course Title"
 * - "shared.xxxxx.xxxxx_xxxx" → "Xxxxx Xxxxxx Xxxx"
 */
export function useKeyToLabel() {
    /**
     * Converts a key to a human-readable label
     * @param key - The key to convert (e.g., "shared.company.address")
     * @returns Human-readable label (e.g., "Company Address")
     */
    const keyToLabel = (key: string): string => {
        if (!key) return '';

        // Remove the first part (before the first dot)
        // e.g., "shared.company.address" → "company.address"
        // e.g., "academy.course.title" → "course.title"
        const firstDotIndex = key.indexOf('.');
        const remainingKey = firstDotIndex > -1 ? key.substring(firstDotIndex + 1) : key;

        // Replace dots and underscores with spaces
        let text = remainingKey.replace(/[._]/g, ' ');

        // Split by spaces and capitalize first letter of each word
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const capitalizedWords = words.map(word => {
            // Capitalize first letter, lowercase the rest
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });

        return capitalizedWords.join(' ');
    };

    return {
        keyToLabel,
    };
}


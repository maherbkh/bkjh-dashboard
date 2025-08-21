/**
 * Composable to generate initials from a name
 * @param name - The full name to extract initials from
 * @returns The initials (first letter of first and last name)
 */
export const useInitials = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return 'U'; // Default fallback for 'User'
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 0) {
        return 'U';
    }

    if (words.length === 1) {
    // Single word - take first two characters or just first if only one character
        const word = words[0]!;
        return word.length >= 2 ? word.substring(0, 2).toUpperCase() : word.charAt(0).toUpperCase();
    }

    // Multiple words - take first letter of first and last word
    const firstInitial = words[0]!.charAt(0);
    const lastInitial = words[words.length - 1]!.charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
};

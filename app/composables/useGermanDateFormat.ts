/**
 * Composable for formatting dates in German locale
 * Auto-imported by Nuxt 3
 */
export const useGermanDateFormat = () => {
    /**
   * Formats a date string to German locale format (DD.MM.YYYY, HH:MM)
   * @param dateString - ISO date string or any valid date string
   * @param options - Optional Intl.DateTimeFormatOptions to customize formatting
   * @returns Formatted date string in German locale
   */
    const formatDate = (
        dateString: string | Date,
        options?: Intl.DateTimeFormatOptions,
    ): string => {
        if (!dateString) return '';

        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

        // Check if date is valid
        if (isNaN(date.getTime())) return '';

        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options,
        };

        return date.toLocaleString('de-DE', defaultOptions);
    };

    /**
   * Formats a date string to German date only (DD.MM.YYYY)
   * @param dateString - ISO date string or any valid date string
   * @returns Formatted date string without time
   */
    const formatDateOnly = (dateString: string | Date): string => {
        return formatDate(dateString, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    /**
   * Formats a date string to German time only (HH:MM)
   * @param dateString - ISO date string or any valid date string
   * @returns Formatted time string
   */
    const formatTimeOnly = (dateString: string | Date): string => {
        return formatDate(dateString, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    /**
   * Formats a date string to German long format (DD. MMMM YYYY, HH:MM)
   * @param dateString - ISO date string or any valid date string
   * @returns Formatted date string in long format
   */
    const formatDateLong = (dateString: string | Date): string => {
        return formatDate(dateString, {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return {
        formatDate,
        formatDateOnly,
        formatTimeOnly,
        formatDateLong,
    };
};

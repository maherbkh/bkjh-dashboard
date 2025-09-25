/**
 * Composable for formatting dates using Day.js with German locale
 * Auto-imported by Nuxt 3
 */
export const useGermanDateFormat = () => {
    const dayjs = useDayjs();

    /**
     * Formats a date string to German locale format (DD.MM.YYYY, HH:MM)
     * @param dateString - ISO date string or any valid date string
     * @param format - Day.js format string (default: 'DD.MM.YYYY, HH:mm')
     * @returns Formatted date string in German locale
     */
    const formatDate = (
        dateString: string | Date,
        format: string = 'DD.MM.YYYY, HH:mm',
    ): string => {
        if (!dateString) return '';

        const date = dayjs(dateString);
        if (!date.isValid()) return '';

        return date.format(format);
    };

    /**
     * Formats a date string to German date only (DD.MM.YYYY)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted date string without time
     */
    const formatDateOnly = (dateString: string | Date): string => {
        return formatDate(dateString, 'DD.MM.YYYY');
    };

    /**
     * Formats a date string to German time only (HH:MM)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted time string
     */
    const formatTimeOnly = (dateString: string | Date): string => {
        return formatDate(dateString, 'HH:mm');
    };

    /**
     * Formats a date string to German long format (DD. MMMM YYYY, HH:MM)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted date string in long format
     */
    const formatDateLong = (dateString: string | Date): string => {
        return formatDate(dateString, 'dddd, DD. MMMM YYYY');
    };

    /**
     * Formats a date string to German short format (DD. MMM YYYY)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted date string in short format
     */
    const formatDateShort = (dateString: string | Date): string => {
        return formatDate(dateString, 'DD. MMM YYYY');
    };

    /**
     * Formats a date string to German week format (DD. MMM)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted date string in week format
     */
    const formatWeek = (dateString: string | Date): string => {
        return formatDate(dateString, 'DD. MMM');
    };

    /**
     * Formats a date string to German month format (MMMM YYYY)
     * @param dateString - ISO date string or any valid date string
     * @returns Formatted date string in month format
     */
    const formatMonth = (dateString: string | Date): string => {
        return formatDate(dateString, 'MMMM YYYY');
    };

    /**
     * Gets relative time (e.g., "vor 2 Stunden", "in 3 Tagen")
     * @param dateString - ISO date string or any valid date string
     * @returns Relative time string in German
     */
    const formatRelative = (dateString: string | Date): string => {
        if (!dateString) return '';

        const date = dayjs(dateString);
        if (!date.isValid()) return '';

        return date.fromNow();
    };

    /**
     * Checks if a date is today
     * @param dateString - ISO date string or any valid date string
     * @returns Boolean indicating if the date is today
     */
    const isToday = (dateString: string | Date): boolean => {
        if (!dateString) return false;

        const date = dayjs(dateString);
        if (!date.isValid()) return false;

        return date.isSame(dayjs(), 'day');
    };

    /**
     * Checks if a date is in the past
     * @param dateString - ISO date string or any valid date string
     * @returns Boolean indicating if the date is in the past
     */
    const isPast = (dateString: string | Date): boolean => {
        if (!dateString) return false;

        const date = dayjs(dateString);
        if (!date.isValid()) return false;

        return date.isBefore(dayjs());
    };

    /**
     * Checks if a date is in the future
     * @param dateString - ISO date string or any valid date string
     * @returns Boolean indicating if the date is in the future
     */
    const isFuture = (dateString: string | Date): boolean => {
        if (!dateString) return false;

        const date = dayjs(dateString);
        if (!date.isValid()) return false;

        return date.isAfter(dayjs());
    };

    /**
     * Returns German-formatted parts for date and time.
     * Example: input → 2025-09-25T11:46:26.152Z
     * Output: { date: '25.09.2025', time: '13:46' }
     */
    const formatDateParts = (dateString: string | Date): { date: string; time: string } => {
        if (!dateString) return { date: '', time: '' };
        const date = dayjs(dateString);
        if (!date.isValid()) return { date: '', time: '' };
        return {
            date: date.format('DD.MM.YYYY'),
            time: date.format('HH:mm'),
        };
    };

    return {
        formatDate,
        formatDateOnly,
        formatTimeOnly,
        formatDateLong,
        formatDateShort,
        formatWeek,
        formatMonth,
        formatRelative,
        isToday,
        isPast,
        isFuture,
        formatDateParts,
    };
};

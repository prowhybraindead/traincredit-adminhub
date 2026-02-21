/**
 * Formats a number as a USD currency string.
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Truncates an ID or string for cleaner table display.
 * @param str - The string to truncate
 * @param start - Number of characters to keep at the start (default: 4)
 * @param end - Number of characters to keep at the end (default: 4)
 */
export const truncateId = (str: string, start = 4, end = 4): string => {
    if (!str || str.length <= start + end) return str || '';
    return `${str.slice(0, start)}...${str.slice(-end)}`;
};

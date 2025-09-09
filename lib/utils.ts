/**
 * Utility functions for common operations
 */

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount)
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

/**
 * Combines CSS class names, filtering out falsy values
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generates a random ID string
 */
export function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
}
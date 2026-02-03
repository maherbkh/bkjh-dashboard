/**
 * Event Question Types and Interfaces
 *
 * Defines types for event questions that will be rendered as form items
 * in the academy frontend. Used in the admin dashboard for question management.
 */

/**
 * Supported question types
 */
export enum EventQuestionType {
    SHORT_TEXT = 'SHORT_TEXT',
    LONG_TEXT = 'LONG_TEXT',
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTI_CHOICE = 'MULTI_CHOICE',
    DROPDOWN = 'DROPDOWN',
    RATING = 'RATING',
    DATE = 'DATE',
}

/**
 * Option for choice-based questions (SINGLE_CHOICE, MULTI_CHOICE, DROPDOWN)
 */
export interface EventQuestionOption {
    label: string; // Required, max 200 characters
    value?: string; // Optional, max 100 characters, defaults to label if not provided
}

/**
 * Rating configuration for RATING type questions
 */
export interface EventQuestionRatingConfig {
    min?: number; // Optional, >= 0, default: 0
    max?: number; // Optional, <= 100, must be > min, default: 5
    step?: number; // Optional, default: 1
    labels?: {
        min?: string; // Optional label for minimum value
        max?: string; // Optional label for maximum value
    };
}

/**
 * Event question interface
 *
 * Represents a question that will be rendered in the event registration form
 */
export interface EventQuestion {
    id?: string; // UUID for question identification (required for existing questions, generated for new ones)
    label: string; // Question label (required, max 500 characters)
    type: EventQuestionType; // Question type (required)
    isRequired?: boolean; // Whether question is required (default: false)
    position?: number; // Manual position for sorting (integer >= 0, must be unique within event)
    placeholder?: string; // Placeholder text (max 255 characters)
    helpText?: string; // Help text (max 1000 characters)
    options?: EventQuestionOption[]; // Options for choice types (required for SINGLE_CHOICE, MULTI_CHOICE, DROPDOWN)
    config?: EventQuestionRatingConfig; // Config for RATING type
}

/**
 * Form data interface for question management
 * Used internally for form state management
 * Currently identical to EventQuestion, but can be extended for form-specific fields
 */
export type EventQuestionFormData = EventQuestion;

/**
 * Type guard to check if question is a choice type
 */
export function isChoiceQuestionType(type: EventQuestionType): boolean {
    return type === EventQuestionType.SINGLE_CHOICE
        || type === EventQuestionType.MULTI_CHOICE
        || type === EventQuestionType.DROPDOWN;
}

/**
 * Type guard to check if question requires options
 */
export function requiresOptions(type: EventQuestionType): boolean {
    return isChoiceQuestionType(type);
}

/**
 * Type guard to check if question requires rating config
 */
export function requiresRatingConfig(type: EventQuestionType): boolean {
    return type === EventQuestionType.RATING;
}

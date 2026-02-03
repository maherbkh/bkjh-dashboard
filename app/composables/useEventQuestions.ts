/**
 * Composable for Event Question Management
 *
 * Provides utilities for validating, normalizing, and managing event questions
 */

import type { EventQuestion, EventQuestionType, EventQuestionOption, EventQuestionRatingConfig } from '~/types/event-question';
import { isChoiceQuestionType, requiresOptions, requiresRatingConfig, EventQuestionType as QuestionType } from '~/types/event-question';

/** Allowed for option labels: letters, numbers, spaces (no special chars) */
const OPTION_LABEL_ALLOWED = /^[a-zA-Z0-9\s]+$/;

/** Allowed for option values: lowercase letters, numbers, underscore (snake_case) */
const OPTION_VALUE_ALLOWED = /^[a-z0-9_]+$/;

/**
 * Derives option value from label: lowercase, spaces → underscore, strip other non-alphanumeric
 * @param label - Raw label string
 * @returns Snake-case value (no special chars)
 */
export function labelToOptionValue(label: string): string {
    if (!label || typeof label !== 'string') return '';
    return label
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

/**
 * Validates options for choice-based questions
 * Label and value must not include special characters (label: letters, numbers, spaces; value: snake_case)
 * @param question - The question to validate options for
 * @returns Array of error messages (empty if valid)
 */
export function validateOptions(question: EventQuestion): string[] {
    const errors: string[] = [];

    if (!requiresOptions(question.type)) {
        return errors;
    }

    if (!question.options || question.options.length === 0) {
        errors.push('At least one option is required for this question type');
        return errors;
    }

    if (question.options.length > 50) {
        errors.push('Maximum 50 options allowed');
    }

    const valueSet = new Set<string>();
    question.options.forEach((option, index) => {
        if (!option.label || option.label.trim().length === 0) {
            errors.push(`Option ${index + 1}: Label is required`);
        }
        else {
            if (option.label.length > 200) {
                errors.push(`Option ${index + 1}: Label must be 200 characters or less`);
            }
            if (!OPTION_LABEL_ALLOWED.test(option.label)) {
                errors.push(`Option ${index + 1}: Label must only contain letters, numbers, and spaces (no special characters)`);
            }
        }

        const value = option.value ?? labelToOptionValue(option.label);
        if (value.length > 100) {
            errors.push(`Option ${index + 1}: Value must be 100 characters or less`);
        }
        if (value && !OPTION_VALUE_ALLOWED.test(value)) {
            errors.push(`Option ${index + 1}: Value must only contain lowercase letters, numbers, and underscores (no special characters)`);
        }

        if (valueSet.has(value)) {
            errors.push(`Option ${index + 1}: Duplicate value "${value}"`);
        }
        else if (value) {
            valueSet.add(value);
        }
    });

    return errors;
}

/**
 * Validates rating configuration
 * @param config - The rating config to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateRatingConfig(config: EventQuestionRatingConfig | undefined): string[] {
    const errors: string[] = [];

    if (!config) {
        return errors;
    }

    const min = config.min ?? 0;
    const max = config.max ?? 5;

    if (min < 0) {
        errors.push('Minimum value must be 0 or greater');
    }

    if (max > 100) {
        errors.push('Maximum value must be 100 or less');
    }

    if (max <= min) {
        errors.push('Maximum value must be greater than minimum value');
    }

    if (config.step !== undefined && config.step <= 0) {
        errors.push('Step must be greater than 0');
    }

    return errors;
}

/**
 * Validates an individual question
 * @param question - The question to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateQuestion(question: EventQuestion): string[] {
    const errors: string[] = [];

    // Label validation
    if (!question.label || question.label.trim().length === 0) {
        errors.push('Label is required');
    }
    else if (question.label.length > 500) {
        errors.push('Label must be 500 characters or less');
    }

    // Type validation
    if (!question.type) {
        errors.push('Type is required');
    }

    // Position validation
    if (question.position !== undefined) {
        if (question.position < 0) {
            errors.push('Position must be 0 or greater');
        }
        if (!Number.isInteger(question.position)) {
            errors.push('Position must be an integer');
        }
    }

    // Placeholder validation
    if (question.placeholder && question.placeholder.length > 255) {
        errors.push('Placeholder must be 255 characters or less');
    }

    // Help text validation
    if (question.helpText && question.helpText.length > 1000) {
        errors.push('Help text must be 1000 characters or less');
    }

    // Type-specific validations
    if (requiresOptions(question.type)) {
        errors.push(...validateOptions(question));
    }

    if (requiresRatingConfig(question.type)) {
        errors.push(...validateRatingConfig(question.config));
    }

    return errors;
}

/**
 * Checks if changing question type is safe and returns warning message
 * @param oldType - The current question type
 * @param newType - The new question type to change to
 * @returns Object with compatibility status and optional warning message
 */
export function checkTypeChangeCompatibility(
    oldType: EventQuestionType,
    newType: EventQuestionType,
): { compatible: boolean; warning?: string } {
    if (oldType === newType) {
        return { compatible: true };
    }

    const warnings: string[] = [];

    // Check if losing options
    if (isChoiceQuestionType(oldType) && !isChoiceQuestionType(newType)) {
        warnings.push('Options will be removed');
    }

    // Check if losing rating config
    if (oldType === QuestionType.RATING && newType !== QuestionType.RATING) {
        warnings.push('Rating configuration will be removed');
    }

    // Check if gaining requirements
    if (!isChoiceQuestionType(oldType) && isChoiceQuestionType(newType)) {
        warnings.push('You will need to add at least one option');
    }

    if (oldType !== QuestionType.RATING && newType === QuestionType.RATING) {
        warnings.push('You will need to configure rating settings');
    }

    if (warnings.length > 0) {
        return {
            compatible: false,
            warning: warnings.join('. ') + '.',
        };
    }

    return { compatible: true };
}

/**
 * Normalizes question data. ID is only set when present (backend-assigned); new questions have no id.
 * @param question - Partial question data to normalize
 * @returns Fully normalized EventQuestion
 */
export function normalizeQuestion(question: Partial<EventQuestion>): EventQuestion {
    const normalized: EventQuestion = {
        ...(question.id && { id: question.id }),
        label: question.label || '',
        type: question.type || QuestionType.SHORT_TEXT,
        isRequired: question.isRequired ?? false,
        position: question.position,
        placeholder: question.placeholder,
        helpText: question.helpText,
    };

    // Normalize options for choice types (value derived from label as snake_case when missing)
    if (isChoiceQuestionType(normalized.type) && question.options) {
        normalized.options = question.options.map(opt => ({
            label: opt.label || '',
            value: opt.value || labelToOptionValue(opt.label || ''),
        }));
    }
    else if (isChoiceQuestionType(normalized.type) && !question.options) {
        normalized.options = [];
    }

    // Normalize rating config
    if (normalized.type === QuestionType.RATING && question.config) {
        normalized.config = {
            min: question.config.min ?? 0,
            max: question.config.max ?? 5,
            step: question.config.step ?? 1,
            labels: question.config.labels,
        };
    }

    return normalized;
}

/**
 * Gets default question structure for a given type. No id (backend assigns on save).
 * @param type - The question type to create defaults for
 * @param defaultPosition - Optional position (defaults to questions index + 1 when adding)
 * @returns Default EventQuestion
 */
export function getDefaultQuestion(type: EventQuestionType, defaultPosition?: number): EventQuestion {
    const question: EventQuestion = {
        label: '',
        type,
        isRequired: false,
        ...(defaultPosition !== undefined && { position: defaultPosition }),
    };

    // Add default options for choice types
    if (isChoiceQuestionType(type)) {
        question.options = [];
    }

    // Add default config for rating type
    if (type === QuestionType.RATING) {
        question.config = {
            min: 0,
            max: 5,
            step: 1,
        };
    }

    return question;
}

/**
 * Gets the next available position (for UI guidance only)
 * @param questions - Array of existing questions
 * @returns Suggested next position number
 */
export function getNextAvailablePosition(questions: EventQuestion[]): number {
    if (questions.length === 0) {
        return 0;
    }

    const positions = questions
        .map(q => q.position ?? -1)
        .filter(p => p >= 0)
        .sort((a, b) => b - a);

    if (positions.length === 0) {
        return 0;
    }

    return positions[0] + 1;
}

/**
 * Prepares questions for API submission
 * Ensures all questions have IDs and validates positions
 * @param questions - Array of questions to prepare
 * @returns Array of prepared questions ready for API submission
 */
export function prepareQuestionsForSubmit(questions: EventQuestion[]): EventQuestion[] {
    return questions.map((question, index) => {
        const prepared = normalizeQuestion(question);

        // Ensure position is set (use index as fallback if not set)
        if (prepared.position === undefined) {
            prepared.position = index;
        }

        // Ensure options have values (derived from label as snake_case when missing)
        if (prepared.options) {
            prepared.options = prepared.options.map(opt => ({
                label: opt.label,
                value: opt.value || labelToOptionValue(opt.label),
            }));
        }

        return prepared;
    });
}

/**
 * Validates position uniqueness within questions array
 * @param questions - Array of questions to validate
 * @returns Array of error messages for duplicate positions (empty if valid)
 */
export function validatePositionUniqueness(questions: EventQuestion[]): string[] {
    const errors: string[] = [];
    const positionMap = new Map<number, number[]>(); // position -> array of question indices

    questions.forEach((question, index) => {
        if (question.position !== undefined) {
            if (!positionMap.has(question.position)) {
                positionMap.set(question.position, []);
            }
            positionMap.get(question.position)!.push(index);
        }
    });

    positionMap.forEach((indices, position) => {
        if (indices.length > 1) {
            errors.push(`Position ${position} is used by multiple questions (indices: ${indices.join(', ')})`);
        }
    });

    return errors;
}

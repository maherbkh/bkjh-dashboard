/**
 * Composable for Event Question Management
 *
 * Provides utilities for validating, normalizing, and managing event questions
 */

import type { EventQuestion, EventQuestionType, EventQuestionOption, EventQuestionRatingConfig } from '~/types/event-question';
import { isChoiceQuestionType, requiresOptions, requiresRatingConfig, EventQuestionType as QuestionType } from '~/types/event-question';

/**
 * Generates a UUID v4 for new questions
 */
/**
 * Generates a UUID v4 for new questions
 * @returns A valid UUID v4 string
 */
export function generateQuestionId(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Validates options for choice-based questions
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
        else if (option.label.length > 200) {
            errors.push(`Option ${index + 1}: Label must be 200 characters or less`);
        }

        const value = option.value || option.label;
        if (value.length > 100) {
            errors.push(`Option ${index + 1}: Value must be 100 characters or less`);
        }

        if (valueSet.has(value)) {
            errors.push(`Option ${index + 1}: Duplicate value "${value}"`);
        }
        else {
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
 * Normalizes question data and generates ID if missing
 * @param question - Partial question data to normalize
 * @returns Fully normalized EventQuestion with all required fields
 */
export function normalizeQuestion(question: Partial<EventQuestion>): EventQuestion {
    const normalized: EventQuestion = {
        id: question.id || generateQuestionId(),
        label: question.label || '',
        type: question.type || QuestionType.SHORT_TEXT,
        isRequired: question.isRequired ?? false,
        position: question.position,
        placeholder: question.placeholder,
        helpText: question.helpText,
    };

    // Normalize options for choice types
    if (isChoiceQuestionType(normalized.type) && question.options) {
        normalized.options = question.options.map(opt => ({
            label: opt.label || '',
            value: opt.value || opt.label || '',
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
 * Gets default question structure for a given type
 * @param type - The question type to create defaults for
 * @param defaultPosition - Optional position (defaults to questions index + 1 when adding)
 * @returns Default EventQuestion with generated UUID
 */
export function getDefaultQuestion(type: EventQuestionType, defaultPosition?: number): EventQuestion {
    const question: EventQuestion = {
        id: generateQuestionId(),
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

        // Ensure options have values
        if (prepared.options) {
            prepared.options = prepared.options.map(opt => ({
                label: opt.label,
                value: opt.value || opt.label,
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

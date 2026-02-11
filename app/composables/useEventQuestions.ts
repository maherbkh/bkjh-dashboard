/**
 * Composable for Event Question Management
 *
 * Provides utilities for validating, normalizing, and managing event questions.
 * Validation functions return i18n keys (and optional params) for translation in components.
 */

import type { EventQuestion, EventQuestionType, EventQuestionOption } from '~/types/event-question';
import { isChoiceQuestionType, requiresOptions, EventQuestionType as QuestionType } from '~/types/event-question';

/** Message suitable for t(key) or t(key, params) in components */
export type QuestionValidationMessage = string | { key: string; params?: Record<string, string | number> };

const V = {
    options_required: 'event.questions.validation.options_required',
    options_max: 'event.questions.validation.options_max',
    option_n_label_required: 'event.questions.validation.option_n_label_required',
    option_n_label_max: 'event.questions.validation.option_n_label_max',
    option_n_label_chars: 'event.questions.validation.option_n_label_chars',
    option_n_value_max: 'event.questions.validation.option_n_value_max',
    option_n_value_chars: 'event.questions.validation.option_n_value_chars',
    option_n_duplicate_value: 'event.questions.validation.option_n_duplicate_value',
    label_required: 'event.questions.validation.label_required',
    label_max: 'event.questions.validation.label_max',
    type_required: 'event.questions.validation.type_required',
    position_min: 'event.questions.validation.position_min',
    position_integer: 'event.questions.validation.position_integer',
    placeholder_max: 'event.questions.validation.placeholder_max',
    help_text_max: 'event.questions.validation.help_text_max',
    type_change_options_removed: 'event.questions.validation.type_change_options_removed',
    type_change_add_option: 'event.questions.validation.type_change_add_option',
    position_duplicate: 'event.questions.validation.position_duplicate',
} as const;

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
 * @returns Array of i18n keys/params for error messages (empty if valid)
 */
export function validateOptions(question: EventQuestion): QuestionValidationMessage[] {
    const errors: QuestionValidationMessage[] = [];

    if (!requiresOptions(question.type)) {
        return errors;
    }

    if (!question.options || question.options.length === 0) {
        errors.push(V.options_required);
        return errors;
    }

    if (question.options.length > 50) {
        errors.push(V.options_max);
    }

    const valueSet = new Set<string>();
    const n = (i: number) => i + 1;
    question.options.forEach((option, index) => {
        if (!option.label || option.label.trim().length === 0) {
            errors.push({ key: V.option_n_label_required, params: { n: n(index) } });
        }
        else {
            if (option.label.length > 200) {
                errors.push({ key: V.option_n_label_max, params: { n: n(index) } });
            }
            if (!OPTION_LABEL_ALLOWED.test(option.label)) {
                errors.push({ key: V.option_n_label_chars, params: { n: n(index) } });
            }
        }

        const value = option.value ?? labelToOptionValue(option.label);
        if (value.length > 100) {
            errors.push({ key: V.option_n_value_max, params: { n: n(index) } });
        }
        if (value && !OPTION_VALUE_ALLOWED.test(value)) {
            errors.push({ key: V.option_n_value_chars, params: { n: n(index) } });
        }

        if (valueSet.has(value)) {
            errors.push({ key: V.option_n_duplicate_value, params: { n: n(index), value } });
        }
        else if (value) {
            valueSet.add(value);
        }
    });

    return errors;
}

/**
 * Validates an individual question
 * @param question - The question to validate
 * @returns Array of i18n keys/params for error messages (empty if valid)
 */
export function validateQuestion(question: EventQuestion): QuestionValidationMessage[] {
    const errors: QuestionValidationMessage[] = [];

    // Label validation
    if (!question.label || question.label.trim().length === 0) {
        errors.push(V.label_required);
    }
    else if (question.label.length > 500) {
        errors.push(V.label_max);
    }

    // Type validation
    if (!question.type) {
        errors.push(V.type_required);
    }

    // Position validation
    if (question.position !== undefined) {
        if (question.position < 0) {
            errors.push(V.position_min);
        }
        if (!Number.isInteger(question.position)) {
            errors.push(V.position_integer);
        }
    }

    // Placeholder validation
    if (question.placeholder && question.placeholder.length > 255) {
        errors.push(V.placeholder_max);
    }

    // Help text validation
    if (question.helpText && question.helpText.length > 1000) {
        errors.push(V.help_text_max);
    }

    // Type-specific validations
    if (requiresOptions(question.type)) {
        errors.push(...validateOptions(question));
    }

    return errors;
}

/**
 * Checks if changing question type is safe and returns warning message keys
 * @param oldType - The current question type
 * @param newType - The new question type to change to
 * @returns Object with compatibility status and optional warning message keys for t()
 */
export function checkTypeChangeCompatibility(
    oldType: EventQuestionType,
    newType: EventQuestionType,
): { compatible: boolean; warningMessages?: QuestionValidationMessage[] } {
    if (oldType === newType) {
        return { compatible: true };
    }

    const warnings: QuestionValidationMessage[] = [];

    if (isChoiceQuestionType(oldType) && !isChoiceQuestionType(newType)) {
        warnings.push(V.type_change_options_removed);
    }

    if (!isChoiceQuestionType(oldType) && isChoiceQuestionType(newType)) {
        warnings.push(V.type_change_add_option);
    }

    if (warnings.length > 0) {
        return {
            compatible: false,
            warningMessages: warnings,
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
        ...(question.hasAnswers !== undefined && { hasAnswers: question.hasAnswers }),
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

    const maxPosition = positions[0];
    return (maxPosition ?? 0) + 1;
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
 * @returns Array of i18n keys/params for duplicate position errors (empty if valid)
 */
export function validatePositionUniqueness(questions: EventQuestion[]): QuestionValidationMessage[] {
    const errors: QuestionValidationMessage[] = [];
    const positionMap = new Map<number, number[]>();

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
            errors.push({
                key: V.position_duplicate,
                params: { position, indices: indices.join(', ') },
            });
        }
    });

    return errors;
}

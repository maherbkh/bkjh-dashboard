/**
 * Base media error class
 */
export class MediaError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = 'MediaError';
    }
}

/**
 * Validation error for file validation failures
 */
export class ValidationError extends MediaError {
    constructor(message: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

/**
 * Upload error for upload failures
 */
export class UploadError extends MediaError {
    constructor(message: string, details?: unknown) {
        super(message, 'UPLOAD_ERROR', details);
        this.name = 'UploadError';
    }
}

/**
 * Permission error for access denied
 */
export class PermissionError extends MediaError {
    constructor(message: string, details?: unknown) {
        super(message, 'PERMISSION_ERROR', details);
        this.name = 'PermissionError';
    }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly string[];
}

/**
 * Error codes for consistent error handling
 */
export enum MediaErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UPLOAD_ERROR = 'UPLOAD_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
    MAX_FILES_EXCEEDED = 'MAX_FILES_EXCEEDED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    NOT_FOUND = 'NOT_FOUND',
    NETWORK_ERROR = 'NETWORK_ERROR',
}

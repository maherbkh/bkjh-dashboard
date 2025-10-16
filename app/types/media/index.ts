/**
 * Barrel export for all media types
 * This provides a clean import interface for the media type system
 */

// Entities
export type { MediaEntity, User } from './entities';

// Enums
export {
    AccessLevel,
    CollectionType,
    MimeTypeCategory,
    SortField,
    SortDirection,
    AuthType,
} from './enums';

// DTOs
export type {
    UploadMediaDto,
    UpdateMediaDto,
    MediaQueryDto,
} from './dtos';

// API Responses
export type {
    ApiResponse,
    ApiMeta,
    UploadResponse,
    BulkUploadResponse,
    UploadFailure,
    MediaStatsResponse,
} from './api-responses';

// Errors
export {
    MediaError,
    ValidationError,
    UploadError,
    PermissionError,
    MediaErrorCode,
} from './errors';
export type { ValidationResult } from './errors';

// Type Guards
export {
    isMediaEntity,
    isUser,
    isAccessLevel,
    isCollectionType,
    isMimeTypeCategory,
    isSortField,
    isSortDirection,
    isImageFile,
    isVideoFile,
    isAudioFile,
    isDocumentFile,
    isArchiveFile,
} from './type-guards';

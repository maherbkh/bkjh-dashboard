/**
 * Access levels for media files
 * Based on your existing system
 */
export enum AccessLevel {
    PUBLIC = 'PUBLIC',
    SELF = 'SELF',
    SUPPORT = 'SUPPORT',
    ACADEMY = 'ACADEMY',
}

/**
 * Collection types for organizing media
 * Based on your existing collectionName options
 */
export enum CollectionType {
    AVATAR = 'avatar',
    COVER = 'cover',
    GALLERY = 'gallery',
    ATTACHMENTS = 'attachments',
    DOCUMENTS = 'documents',
    DEFAULT = 'default',
}

/**
 * MIME type categories for filtering and validation
 */
export enum MimeTypeCategory {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
    AUDIO = 'audio',
    ARCHIVE = 'archive',
    OTHER = 'other',
}

/**
 * Sort fields for media queries
 */
export enum SortField {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    FILENAME = 'filename',
    SIZE = 'size',
    MIME_TYPE = 'mimeType',
}

/**
 * Auth types for media ownership
 */
export enum AuthType {
    ADMIN = 'ADMIN',
    ATENDEE = 'ATENDEE',
}

/**
 * Sort directions
 */
export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

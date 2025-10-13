import type { MediaEntity, User } from './entities'
import type { AccessLevel, CollectionType, MimeTypeCategory, SortField, SortDirection } from './enums'

/**
 * Type guard to check if a value is a MediaEntity
 */
export function isMediaEntity(value: unknown): value is MediaEntity {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'uuid' in value &&
    'filename' in value &&
    'mimeType' in value &&
    'size' in value &&
    'accessLevel' in value
  )
}

/**
 * Type guard to check if a value is a User
 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'firstName' in value &&
    'lastName' in value &&
    'isSuperAdmin' in value &&
    'apps' in value
  )
}

/**
 * Type guard to check if a value is a valid AccessLevel
 */
export function isAccessLevel(value: unknown): value is AccessLevel {
  return typeof value === 'string' && Object.values(AccessLevel).includes(value as AccessLevel)
}

/**
 * Type guard to check if a value is a valid CollectionType
 */
export function isCollectionType(value: unknown): value is CollectionType {
  return typeof value === 'string' && Object.values(CollectionType).includes(value as CollectionType)
}

/**
 * Type guard to check if a value is a valid MimeTypeCategory
 */
export function isMimeTypeCategory(value: unknown): value is MimeTypeCategory {
  return typeof value === 'string' && Object.values(MimeTypeCategory).includes(value as MimeTypeCategory)
}

/**
 * Type guard to check if a value is a valid SortField
 */
export function isSortField(value: unknown): value is SortField {
  return typeof value === 'string' && Object.values(SortField).includes(value as SortField)
}

/**
 * Type guard to check if a value is a valid SortDirection
 */
export function isSortDirection(value: unknown): value is SortDirection {
  return typeof value === 'string' && Object.values(SortDirection).includes(value as SortDirection)
}

/**
 * Type guard to check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Type guard to check if a file is a video
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

/**
 * Type guard to check if a file is an audio file
 */
export function isAudioFile(mimeType: string): boolean {
  return mimeType.startsWith('audio/')
}

/**
 * Type guard to check if a file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  return (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('text/') ||
    mimeType.includes('application/msword') ||
    mimeType.includes('application/vnd.openxmlformats')
  )
}

/**
 * Type guard to check if a file is an archive
 */
export function isArchiveFile(mimeType: string): boolean {
  return (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z') ||
    mimeType.includes('tar') ||
    mimeType.includes('gz')
  )
}

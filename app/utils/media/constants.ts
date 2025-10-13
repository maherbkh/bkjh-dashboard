
import { MimeTypeCategory } from '~/types/media/enums'

/**
 * Media constants for the dashboard project
 * Based on your existing validation rules and requirements
 */
export const MEDIA_CONSTANTS = {
  /**
   * Maximum file sizes in bytes for different contexts
   * Dashboard has the highest limits as it's the main admin interface
   */
  MAX_FILE_SIZE: {
    DASHBOARD: 50 * 1024 * 1024, // 50MB
    ACADEMY: 10 * 1024 * 1024,   // 10MB
    SUPPORT: 10 * 1024 * 1024    // 10MB
  },

  /**
   * Maximum number of files per upload
   */
  MAX_FILES: {
    DASHBOARD: 50,
    ACADEMY: 5,
    SUPPORT: 5
  },

  /**
   * Allowed MIME types for upload
   * Based on your existing validation rules
   */
  ALLOWED_MIME_TYPES: [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
    
    // Documents
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/rtf',
    
    // Audio
    'audio/mpeg',
    'audio/aac',
    'audio/wav',
    'audio/ogg',
    
    // Video
    'video/mp4',
    'video/webm',
    'video/mpeg',
    'video/x-msvideo',
    
    // Archives
    'application/zip',
    'application/x-7z-compressed',
    'application/gzip',
    'application/vnd.rar',
    'application/x-tar'
  ] as const,

  /**
   * Globally denied MIME types for security
   */
  DENIED_MIME_TYPES: [
    'text/html',
    'application/javascript',
    'text/javascript',
    'application/x-msdownload',
    'application/java-archive',
    'application/x-sh',
    'application/x-dosexec',
    'application/wasm',
    'application/x-php'
  ] as const,

  /**
   * File type configurations with specific rules
   */
  FILE_TYPE_CONFIG: {
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 50,
      allowedTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif'
      ],
      deniedTypes: ['image/svg+xml'] // SVG requires super admin
    },
    svg: {
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
      allowedTypes: ['image/svg+xml'],
      deniedTypes: []
    },
    audio: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 20,
      allowedTypes: [
        'audio/mpeg',
        'audio/aac',
        'audio/wav',
        'audio/ogg'
      ],
      deniedTypes: []
    },
    video: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
      allowedTypes: [
        'video/mp4',
        'video/webm',
        'video/mpeg',
        'video/x-msvideo'
      ],
      deniedTypes: []
    },
    document: {
      maxSize: 25 * 1024 * 1024, // 25MB
      maxFiles: 20,
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/rtf'
      ],
      deniedTypes: []
    },
    archive: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5,
      allowedTypes: [
        'application/zip',
        'application/x-7z-compressed',
        'application/gzip',
        'application/vnd.rar',
        'application/x-tar'
      ],
      deniedTypes: []
    }
  },

  /**
   * UI Configuration
   */
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  
  /**
   * Grid configuration
   */
  GRID_COLUMNS: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large: 6
  },

  /**
   * Upload configuration
   */
  UPLOAD: {
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks
    MAX_CONCURRENT_UPLOADS: 3,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  },

  /**
   * Cache configuration
   */
  CACHE: {
    MEDIA_LIST_TTL: 5 * 60 * 1000, // 5 minutes
    MEDIA_DETAILS_TTL: 10 * 60 * 1000, // 10 minutes
    STATS_TTL: 15 * 60 * 1000 // 15 minutes
  }
} as const

/**
 * Type for media constants
 */
export type MediaConstants = typeof MEDIA_CONSTANTS

/**
 * Get file type category from MIME type
 */
export function getMimeTypeCategory(mimeType: string): MimeTypeCategory {
  if (mimeType.startsWith('image/')) return MimeTypeCategory.IMAGE
  if (mimeType.startsWith('video/')) return MimeTypeCategory.VIDEO
  if (mimeType.startsWith('audio/')) return MimeTypeCategory.AUDIO
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text/')) {
    return MimeTypeCategory.DOCUMENT
  }
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar')) {
    return MimeTypeCategory.ARCHIVE
  }
  return MimeTypeCategory.OTHER
}

/**
 * Get file type configuration for a specific category
 */
export function getFileTypeConfig(category: string) {
  return MEDIA_CONSTANTS.FILE_TYPE_CONFIG[category as keyof typeof MEDIA_CONSTANTS.FILE_TYPE_CONFIG]
}

/**
 * Check if a MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.includes(mimeType as any)
}

/**
 * Check if a MIME type is denied
 */
export function isDeniedMimeType(mimeType: string): boolean {
  return MEDIA_CONSTANTS.DENIED_MIME_TYPES.includes(mimeType as any)
}

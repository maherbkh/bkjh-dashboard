import type { ValidationResult } from '~/types/media/index'
import { ValidationError, MediaErrorCode } from '~/types/media/index'
import { MEDIA_CONSTANTS, getMimeTypeCategory, isAllowedMimeType, isDeniedMimeType } from '~/utils/media'

/**
 * Media validation service
 * Handles all file validation logic with security checks
 */
export class MediaValidator {
  /**
   * Validate a single file
   */
  validateFile(file: File, context: 'dashboard' | 'academy' | 'support' = 'dashboard'): ValidationResult {
    const errors: string[] = []

    // Check file size
    const maxSize = MEDIA_CONSTANTS.MAX_FILE_SIZE[context.toUpperCase()]
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${this.formatBytes(maxSize)}`)
    }

    // Check globally denied types first
    if (isDeniedMimeType(file.type)) {
      errors.push(`File type "${file.type}" is not allowed for security reasons`)
      return { isValid: false, errors: Object.freeze(errors) }
    }

    // Check allowed MIME types
    if (!isAllowedMimeType(file.type)) {
      errors.push(`File type "${file.type}" is not allowed`)
    }

    // Check file type specific rules
    const category = getMimeTypeCategory(file.type)
    const typeConfig = MEDIA_CONSTANTS.FILE_TYPE_CONFIG[category]
    
    if (typeConfig) {
      // Check type-specific size limit
      if (file.size > typeConfig.maxSize) {
        errors.push(`${category} files cannot exceed ${this.formatBytes(typeConfig.maxSize)}`)
      }

      // Check if type is in denied types for this category
      if (typeConfig.deniedTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed for ${category} files`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    }
  }

  /**
   * Validate multiple files
   */
  validateFiles(files: File[], context: 'dashboard' | 'academy' | 'support' = 'dashboard'): ValidationResult {
    const errors: string[] = []

    // Check file count
    const maxFiles = MEDIA_CONSTANTS.MAX_FILES[context.toUpperCase()]
    if (files.length > maxFiles) {
      errors.push(`Cannot upload more than ${maxFiles} files at once`)
    }

    // Validate each file
    files.forEach((file, index) => {
      const fileValidation = this.validateFile(file, context)
      if (!fileValidation.isValid) {
        fileValidation.errors.forEach(error => {
          errors.push(`File ${index + 1} (${file.name}): ${error}`)
        })
      }
    })

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    }
  }

  /**
   * Validate file for specific category
   */
  validateFileForCategory(file: File, category: string, context: 'dashboard' | 'academy' | 'support' = 'dashboard'): ValidationResult {
    const errors: string[] = []
    const typeConfig = MEDIA_CONSTANTS.FILE_TYPE_CONFIG[category as keyof typeof MEDIA_CONSTANTS.FILE_TYPE_CONFIG]

    if (!typeConfig) {
      errors.push(`Invalid file category: ${category}`)
      return { isValid: false, errors: Object.freeze(errors) }
    }

    // Check file size against category limit
    if (file.size > typeConfig.maxSize) {
      errors.push(`${category} files cannot exceed ${this.formatBytes(typeConfig.maxSize)}`)
    }

    // Check if MIME type is allowed for this category
    if (!typeConfig.allowedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not allowed for ${category} files`)
    }

    // Check if MIME type is denied for this category
    if (typeConfig.deniedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not allowed for ${category} files`)
    }

    return {
      isValid: errors.length === 0,
      errors: Object.freeze(errors)
    }
  }

  /**
   * Check if user can upload SVG files (super admin only)
   */
  canUploadSvg(user: { isSuperAdmin: boolean }): boolean {
    return user.isSuperAdmin
  }

  /**
   * Validate SVG file with super admin check
   */
  validateSvgFile(file: File, user: { isSuperAdmin: boolean }): ValidationResult {
    const errors: string[] = []

    if (file.type === 'image/svg+xml') {
      if (!this.canUploadSvg(user)) {
        errors.push('SVG files can only be uploaded by super administrators')
        return { isValid: false, errors: Object.freeze(errors) }
      }
    }

    return this.validateFileForCategory(file, 'svg')
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }
}

/**
 * Singleton instance for global use
 */
export const mediaValidator = new MediaValidator()

import { MimeTypeCategory } from '~/types/media/index'
import { getMimeTypeCategory } from '~/utils/media'

/**
 * Media formatting service
 * Handles all formatting utilities for media display
 */
export class MediaFormatter {
  /**
   * Format file size to human readable string
   */
  formatFileSize(bytes: number | string): string {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (size === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format date to locale string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString()
  }

  /**
   * Format date to relative time (e.g., "2 hours ago")
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  /**
   * Get MIME type category
   */
  getMimeTypeCategory(mimeType: string): MimeTypeCategory {
    return getMimeTypeCategory(mimeType)
  }

  /**
   * Get file icon based on MIME type
   */
  getFileIcon(mimeType: string): string {
    const category = this.getMimeTypeCategory(mimeType)
    
    switch (category) {
      case MimeTypeCategory.IMAGE:
        if (mimeType === 'image/svg+xml') return 'solar:code-square-outline'
        return 'solar:gallery-outline'
      
      case MimeTypeCategory.VIDEO:
        return 'solar:video-camera-outline'
      
      case MimeTypeCategory.AUDIO:
        return 'solar:music-note-outline'
      
      case MimeTypeCategory.DOCUMENT:
        if (mimeType.includes('pdf')) return 'solar:document-outline'
        if (mimeType.includes('word') || mimeType.includes('doc')) return 'solar:document-text-outline'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'solar:chart-outline'
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'solar:presentation-graph-outline'
        if (mimeType.includes('text/plain')) return 'solar:document-text-outline'
        if (mimeType.includes('rtf')) return 'solar:document-outline'
        return 'solar:document-outline'
      
      case MimeTypeCategory.ARCHIVE:
        return 'solar:archive-outline'
      
      default:
        return 'solar:file-outline'
    }
  }

  /**
   * Get file type display name
   */
  getFileTypeDisplayName(mimeType: string): string {
    const category = this.getMimeTypeCategory(mimeType)
    
    switch (category) {
      case MimeTypeCategory.IMAGE:
        if (mimeType === 'image/svg+xml') return 'SVG Image'
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG Image'
        if (mimeType.includes('png')) return 'PNG Image'
        if (mimeType.includes('webp')) return 'WebP Image'
        if (mimeType.includes('gif')) return 'GIF Image'
        if (mimeType.includes('avif')) return 'AVIF Image'
        return 'Image'
      
      case MimeTypeCategory.VIDEO:
        if (mimeType.includes('mp4')) return 'MP4 Video'
        if (mimeType.includes('webm')) return 'WebM Video'
        if (mimeType.includes('mpeg')) return 'MPEG Video'
        if (mimeType.includes('avi')) return 'AVI Video'
        return 'Video'
      
      case MimeTypeCategory.AUDIO:
        if (mimeType.includes('mpeg')) return 'MP3 Audio'
        if (mimeType.includes('aac')) return 'AAC Audio'
        if (mimeType.includes('wav')) return 'WAV Audio'
        if (mimeType.includes('ogg')) return 'OGG Audio'
        return 'Audio'
      
      case MimeTypeCategory.DOCUMENT:
        if (mimeType.includes('pdf')) return 'PDF Document'
        if (mimeType.includes('word')) return 'Word Document'
        if (mimeType.includes('excel')) return 'Excel Spreadsheet'
        if (mimeType.includes('powerpoint')) return 'PowerPoint Presentation'
        if (mimeType.includes('text/plain')) return 'Text Document'
        if (mimeType.includes('rtf')) return 'Rich Text Document'
        return 'Document'
      
      case MimeTypeCategory.ARCHIVE:
        if (mimeType.includes('zip')) return 'ZIP Archive'
        if (mimeType.includes('rar')) return 'RAR Archive'
        if (mimeType.includes('7z')) return '7-Zip Archive'
        if (mimeType.includes('tar')) return 'TAR Archive'
        if (mimeType.includes('gz')) return 'GZIP Archive'
        return 'Archive'
      
      default:
        return 'File'
    }
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Get filename without extension
   */
  getFilenameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.')
    return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
  }

  /**
   * Truncate filename to specified length
   */
  truncateFilename(filename: string, maxLength: number = 30): string {
    if (filename.length <= maxLength) return filename
    
    const extension = this.getFileExtension(filename)
    const nameWithoutExt = this.getFilenameWithoutExtension(filename)
    const availableLength = maxLength - extension.length - 4 // 4 for "..."
    
    if (availableLength <= 0) return filename
    
    return `${nameWithoutExt.substring(0, availableLength)}...${extension ? '.' + extension : ''}`
  }

  /**
   * Format upload progress percentage
   */
  formatProgress(loaded: number, total: number): string {
    if (total === 0) return '0%'
    const percentage = Math.round((loaded / total) * 100)
    return `${percentage}%`
  }

  /**
   * Format upload speed
   */
  formatUploadSpeed(bytesPerSecond: number): string {
    return `${this.formatFileSize(bytesPerSecond)}/s`
  }

  /**
   * Format remaining time
   */
  formatRemainingTime(remainingBytes: number, bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return 'Unknown'
    
    const seconds = Math.ceil(remainingBytes / bytesPerSecond)
    
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`
    
    return `${Math.ceil(seconds / 3600)}h`
  }
}

/**
 * Singleton instance for global use
 */
export const mediaFormatter = new MediaFormatter()

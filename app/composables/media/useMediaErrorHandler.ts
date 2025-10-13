import { toast } from 'vue-sonner'
import type { MediaError } from '~/types/media/index'
import { ValidationError, UploadError, PermissionError } from '~/types/media/index'

export function useMediaErrorHandler() {
  const errors = ref<MediaError[]>([])
  const isError = computed(() => errors.value.length > 0)
  const hasValidationErrors = computed(() => 
    errors.value.some(error => error instanceof ValidationError)
  )
  const hasUploadErrors = computed(() => 
    errors.value.some(error => error instanceof UploadError)
  )
  const hasPermissionErrors = computed(() => 
    errors.value.some(error => error instanceof PermissionError)
  )

  const addError = (error: MediaError) => {
    errors.value.push(error)
    
    // Show toast notification
    const message = getUserFriendlyMessage(error)
    const title = getErrorTitle(error)
    toast.error(title, {
      description: message,
      duration: 5000
    })
  }

  const addValidationError = (message: string, details?: unknown) => {
    const error = new ValidationError(message, details)
    addError(error)
  }

  const addUploadError = (message: string, code: string, details?: unknown) => {
    const error = new UploadError(message, details)
    addError(error)
  }

  const addPermissionError = (message: string, details?: unknown) => {
    const error = new PermissionError(message, details)
    addError(error)
  }

  const showSuccess = (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 3000
    })
  }

  const showInfo = (title: string, description?: string) => {
    toast.info(title, {
      description,
      duration: 4000
    })
  }

  const showWarning = (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 4000
    })
  }

  const clearErrors = () => {
    errors.value = []
  }

  const clearValidationErrors = () => {
    errors.value = errors.value.filter(error => !(error instanceof ValidationError))
  }

  const clearUploadErrors = () => {
    errors.value = errors.value.filter(error => !(error instanceof UploadError))
  }

  const clearPermissionErrors = () => {
    errors.value = errors.value.filter(error => !(error instanceof PermissionError))
  }

  const getErrorTitle = (error: MediaError): string => {
    if (error instanceof ValidationError) {
      return 'Validation Error'
    }
    if (error instanceof UploadError) {
      return 'Upload Error'
    }
    if (error instanceof PermissionError) {
      return 'Permission Error'
    }
    return 'Error'
  }

  const getUserFriendlyMessage = (error: MediaError): string => {
    switch (error.constructor.name) {
      case 'ValidationError':
        return getValidationMessage(error as ValidationError)
      case 'UploadError':
        return getUploadMessage(error as UploadError)
      case 'PermissionError':
        return getPermissionMessage(error as PermissionError)
      default:
        return error.message
    }
  }

  const getValidationMessage = (error: ValidationError): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('size')) {
      return 'File size is too large. Please choose a smaller file.'
    }
    if (message.includes('type') || message.includes('format')) {
      return 'File type is not supported. Please choose a different file type.'
    }
    if (message.includes('security') || message.includes('virus')) {
      return 'File failed security check. Please choose a different file.'
    }
    if (message.includes('corrupted')) {
      return 'File appears to be corrupted. Please try a different file.'
    }
    
    return 'File validation failed. Please check your file and try again.'
  }

  const getUploadMessage = (error: UploadError): string => {
    switch (error.code) {
      case 'UPLOAD_FAILED':
        return 'Upload failed. Please check your internet connection and try again.'
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.'
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.'
      case 'QUOTA_EXCEEDED':
        return 'Storage quota exceeded. Please contact support.'
      case 'FILE_TOO_LARGE':
        return 'File is too large. Please choose a smaller file.'
      case 'INVALID_FILE_TYPE':
        return 'File type not allowed. Please choose a different file type.'
      default:
        return 'Upload failed. Please try again.'
    }
  }

  const getPermissionMessage = (error: PermissionError): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('upload')) {
      return 'You do not have permission to upload files.'
    }
    if (message.includes('delete')) {
      return 'You do not have permission to delete this file.'
    }
    if (message.includes('edit')) {
      return 'You do not have permission to edit this file.'
    }
    if (message.includes('access')) {
      return 'You do not have permission to access this file.'
    }
    
    return 'Permission denied. Please contact support if you believe this is an error.'
  }

  const getErrorSummary = (): string => {
    if (errors.value.length === 0) return ''
    
    const validationCount = errors.value.filter(e => e instanceof ValidationError).length
    const uploadCount = errors.value.filter(e => e instanceof UploadError).length
    const permissionCount = errors.value.filter(e => e instanceof PermissionError).length
    
    const parts: string[] = []
    if (validationCount > 0) parts.push(`${validationCount} validation error${validationCount > 1 ? 's' : ''}`)
    if (uploadCount > 0) parts.push(`${uploadCount} upload error${uploadCount > 1 ? 's' : ''}`)
    if (permissionCount > 0) parts.push(`${permissionCount} permission error${permissionCount > 1 ? 's' : ''}`)
    
    return parts.join(', ')
  }

  return {
    errors: computed(() => errors.value),
    isError,
    hasValidationErrors,
    hasUploadErrors,
    hasPermissionErrors,
    addError,
    addValidationError,
    addUploadError,
    addPermissionError,
    clearErrors,
    clearValidationErrors,
    clearUploadErrors,
    clearPermissionErrors,
    getUserFriendlyMessage,
    getErrorSummary,
    showSuccess,
    showInfo,
    showWarning
  }
}

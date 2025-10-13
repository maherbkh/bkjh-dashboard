<template>
  <div v-if="hasErrors" class="space-y-3">
    <Alert
      v-for="(error, index) in errors"
      :key="index"
      :variant="getAlertVariant(error)"
      class="border-destructive/50 text-destructive dark:border-destructive"
    >
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>{{ getErrorTitle(error) }}</AlertTitle>
      <AlertDescription>
        {{ getUserFriendlyMessage(error) }}
      </AlertDescription>
    </Alert>
    
    <div v-if="showSummary" class="text-sm text-muted-foreground">
      {{ errorSummary }}
    </div>
    
    <div v-if="showActions" class="flex gap-2">
      <Button
        v-if="hasValidationErrors"
        variant="outline"
        size="sm"
        @click="$emit('clear-validation')"
      >
        Clear Validation Errors
      </Button>
      <Button
        v-if="hasUploadErrors"
        variant="outline"
        size="sm"
        @click="$emit('clear-upload')"
      >
        Clear Upload Errors
      </Button>
      <Button
        v-if="hasPermissionErrors"
        variant="outline"
        size="sm"
        @click="$emit('clear-permission')"
      >
        Clear Permission Errors
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="$emit('clear-all')"
      >
        Clear All Errors
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import type { MediaError } from '~/types/media/index'
import { ValidationError, UploadError, PermissionError } from '~/types/media/index'

interface Props {
  errors: MediaError[]
  showSummary?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSummary: true,
  showActions: true
})

const emit = defineEmits<{
  'clear-validation': []
  'clear-upload': []
  'clear-permission': []
  'clear-all': []
}>()

const hasErrors = computed(() => props.errors.length > 0)

const hasValidationErrors = computed(() => 
  props.errors.some(error => error instanceof ValidationError)
)

const hasUploadErrors = computed(() => 
  props.errors.some(error => error instanceof UploadError)
)

const hasPermissionErrors = computed(() => 
  props.errors.some(error => error instanceof PermissionError)
)

const errorSummary = computed(() => {
  if (props.errors.length === 0) return ''
  
  const validationCount = props.errors.filter(e => e instanceof ValidationError).length
  const uploadCount = props.errors.filter(e => e instanceof UploadError).length
  const permissionCount = props.errors.filter(e => e instanceof PermissionError).length
  
  const parts: string[] = []
  if (validationCount > 0) parts.push(`${validationCount} validation error${validationCount > 1 ? 's' : ''}`)
  if (uploadCount > 0) parts.push(`${uploadCount} upload error${uploadCount > 1 ? 's' : ''}`)
  if (permissionCount > 0) parts.push(`${permissionCount} permission error${permissionCount > 1 ? 's' : ''}`)
  
  return parts.join(', ')
})

const getAlertVariant = (error: MediaError): 'default' | 'destructive' => {
  if (error instanceof ValidationError) return 'default'
  if (error instanceof UploadError) return 'destructive'
  if (error instanceof PermissionError) return 'destructive'
  return 'default'
}

const getErrorTitle = (error: MediaError): string => {
  if (error instanceof ValidationError) return 'Validation Error'
  if (error instanceof UploadError) return 'Upload Error'
  if (error instanceof PermissionError) return 'Permission Error'
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
</script>

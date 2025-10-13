<script setup lang="ts">
import type { MediaEntity, AccessLevel, CollectionType } from '~/types/media/index'
import { AccessLevel as AccessLevelEnum, CollectionType as CollectionTypeEnum } from '~/types/media/index'
import { useMediaRepository, useMediaPermissions, useMediaErrorHandler, useMediaLoading } from '~/composables/media'
import { toast } from 'vue-sonner'
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage'
import { mediaValidator, mediaFormatter } from '~/services/media'
import MediaErrorDisplay from '~/components/Media/molecules/MediaErrorDisplay.vue'

interface Props {
    modelValue?: MediaEntity | MediaEntity[] | null
    label?: string
    name?: string
    required?: boolean
    multiple?: boolean
    maxFiles?: number
    maxSize?: number // in MB
    allowedTypes?: string[]
    accessLevel?: AccessLevel
    collectionName?: CollectionType
    modelType?: string
    modelId?: string
    directory?: string
    errors?: string[]
    disabled?: boolean
    placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    label: '',
    name: '',
    required: false,
    multiple: false,
    maxFiles: 1,
    maxSize: 10, // 10MB default
    allowedTypes: () => ['image'],
    accessLevel: AccessLevelEnum.PUBLIC,
    collectionName: CollectionTypeEnum.DEFAULT,
    modelType: '',
    modelId: '',
    directory: 'shared',
    errors: () => [],
    disabled: false,
    placeholder: '',
})

const emit = defineEmits<{
    'update:modelValue': [value: MediaEntity | MediaEntity[] | null]
    'upload:start': []
    'upload:success': [file: MediaEntity]
    'upload:error': [error: string]
}>()

const { t } = useI18n()
const { getDirectImageSrc } = useAuthenticatedImage()

// Use new composables
const repository = useMediaRepository()
const permissions = useMediaPermissions()
const errorHandler = useMediaErrorHandler()
const loading = useMediaLoading()

// Template refs
const fileInputRef = ref<HTMLInputElement>()

// State management
const files = ref<MediaEntity[]>([])
const dragging = ref(false)

// Ensure files is always an array
const safeFiles = computed(() => {
    if (!files.value) return []
    return Array.isArray(files.value) ? files.value : []
})

// Watch for modelValue changes
watch(() => props.modelValue, (newValue: MediaEntity | MediaEntity[] | null) => {
    if (newValue !== safeFiles.value) {
        if (Array.isArray(newValue)) {
            files.value = newValue
        } else if (newValue) {
            files.value = [newValue]
        } else {
            files.value = []
        }
    }
})

// Watch for files changes and emit
watch(safeFiles, (newFiles: MediaEntity[]) => {
    if (props.multiple) {
        emit('update:modelValue', [...newFiles])
    } else {
        emit('update:modelValue', newFiles.length > 0 ? newFiles[0] as MediaEntity : null)
    }
}, { deep: true })

// Upload functions using new architecture
const uploadFile = async (file: File) => {
    console.log('🚀 [MediaUploader] Starting single file upload:', {
        filename: file.name,
        size: file.size,
        type: file.type,
        props: {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory
        }
    })

    loading.startUpload('single')
    errorHandler.clearErrors()

    try {
        console.log('📋 [MediaUploader] Step 1: Validating file...')
        // Validate file
        const validation = mediaValidator.validateFile(file, 'dashboard')
        console.log('📋 [MediaUploader] Validation result:', validation)
        
        if (!validation.isValid) {
            console.error('❌ [MediaUploader] File validation failed:', validation.errors)
            validation.errors.forEach(error => errorHandler.addValidationError(error))
            emit('upload:error', validation.errors.join(', '))
            return
        }
        console.log('✅ [MediaUploader] File validation passed')

        console.log('🔐 [MediaUploader] Step 2: Checking permissions...')
        // Check permissions
        console.log('🔐 [MediaUploader] Permission check result:', {
            canUpload: permissions.canUpload.value,
            user: permissions.currentUser.value
        })
        
        if (!permissions.canUpload.value) {
            const error = 'You do not have permission to upload files'
            console.error('❌ [MediaUploader] Permission denied:', error)
            errorHandler.addPermissionError(error)
            emit('upload:error', error)
            return
        }
        console.log('✅ [MediaUploader] Permission check passed')

        console.log('📤 [MediaUploader] Step 3: Emitting upload start event...')
        emit('upload:start')

        console.log('🌐 [MediaUploader] Step 4: Calling repository.create...')
        console.log('🌐 [MediaUploader] Repository call parameters:', {
            file: {
                name: file.name,
                size: file.size,
                type: file.type
            },
            options: {
                accessLevel: props.accessLevel,
                collectionName: props.collectionName,
                modelType: props.modelType,
                modelId: props.modelId,
                directory: props.directory
            }
        })

        // Upload file
        const result = await repository.create(file, {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory
        })

        console.log('✅ [MediaUploader] Repository.create completed:', result)

        // Add to files array
        const newFile = result as MediaEntity
        console.log('📁 [MediaUploader] Step 5: Adding file to local state...')
        console.log('📁 [MediaUploader] New file data:', newFile)
        
        if (props.multiple) {
            files.value = [...files.value, newFile]
            console.log('📁 [MediaUploader] Added to multiple files array. Total files:', files.value.length)
        } else {
            files.value = [newFile]
            console.log('📁 [MediaUploader] Set as single file')
        }

        console.log('🎉 [MediaUploader] Step 6: Emitting success events...')
        emit('upload:success', newFile)
        toast.success(t('media.upload_success'), {
            description: t('media.file_uploaded', { filename: newFile.filename })
        })
        console.log('✅ [MediaUploader] Single file upload completed successfully!')
        
    } catch (error) {
        console.error('❌ [MediaUploader] Upload failed with error:', error)
        console.error('❌ [MediaUploader] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error
        })
        
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        errorHandler.addUploadError(errorMessage, 'UPLOAD_FAILED', error)
        emit('upload:error', errorMessage)
    } finally {
        console.log('🏁 [MediaUploader] Finishing upload process...')
        loading.finishUpload('single')
    }
}

const uploadFiles = async (fileList: File[]) => {
    console.log('🚀 [MediaUploader] Starting multiple files upload:', {
        fileCount: fileList.length,
        files: fileList.map(f => ({ name: f.name, size: f.size, type: f.type })),
        props: {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory
        }
    })

    try {
        console.log('📋 [MediaUploader] Step 1: Validating multiple files...')
        // Validate files
        const validation = mediaValidator.validateFiles(fileList, 'dashboard')
        console.log('📋 [MediaUploader] Multiple files validation result:', validation)
        
        if (!validation.isValid) {
            console.error('❌ [MediaUploader] Multiple files validation failed:', validation.errors)
            validation.errors.forEach(error => errorHandler.addValidationError(error))
            emit('upload:error', validation.errors.join(', '))
            return
        }
        console.log('✅ [MediaUploader] Multiple files validation passed')

        console.log('🔐 [MediaUploader] Step 2: Checking permissions for multiple files...')
        // Check permissions
        console.log('🔐 [MediaUploader] Permission check result:', {
            canUpload: permissions.canUpload.value,
            user: permissions.currentUser.value
        })
        
        if (!permissions.canUpload.value) {
            const error = 'You do not have permission to upload files'
            console.error('❌ [MediaUploader] Permission denied for multiple files:', error)
            errorHandler.addPermissionError(error)
            emit('upload:error', error)
            return
        }
        console.log('✅ [MediaUploader] Permission check passed for multiple files')

        console.log('📤 [MediaUploader] Step 3: Starting multiple files upload process...')
        loading.startUpload('multiple')
        emit('upload:start')

        console.log('🌐 [MediaUploader] Step 4: Calling repository.createMany...')
        console.log('🌐 [MediaUploader] Repository call parameters:', {
            fileList: fileList.map(f => ({ name: f.name, size: f.size, type: f.type })),
            options: {
                accessLevel: props.accessLevel,
                collectionName: props.collectionName,
                modelType: props.modelType,
                modelId: props.modelId,
                directory: props.directory
            }
        })

        // Upload files
        const result = await repository.createMany(fileList, {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory
        })

        console.log('✅ [MediaUploader] Repository.createMany completed:', result)

        // Add successful uploads to files array
        const newFiles = result.successful as MediaEntity[]
        console.log('📁 [MediaUploader] Step 5: Adding successful files to local state...')
        console.log('📁 [MediaUploader] Successful files:', newFiles)
        
        if (props.multiple) {
            files.value = [...files.value, ...newFiles]
            console.log('📁 [MediaUploader] Added to multiple files array. Total files:', files.value.length)
        } else if (newFiles.length > 0) {
            files.value = [newFiles[0]!]
            console.log('📁 [MediaUploader] Set first file as single file')
        }

        console.log('🎉 [MediaUploader] Step 6: Emitting success events for multiple files...')
        if (newFiles.length > 0) {
            emit('upload:success', newFiles[0]!)
        }
        toast.success(t('media.upload_success'), {
            description: t('media.files_uploaded', { count: newFiles.length })
        })
        console.log('✅ [MediaUploader] Multiple files upload completed successfully!')
        
    } catch (error) {
        console.error('❌ [MediaUploader] Multiple files upload failed with error:', error)
        console.error('❌ [MediaUploader] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error
        })
        
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        errorHandler.addUploadError(errorMessage, 'UPLOAD_FAILED', error)
        emit('upload:error', errorMessage)
    } finally {
        console.log('🏁 [MediaUploader] Finishing multiple files upload process...')
        loading.finishUpload('multiple')
    }
}

const handleFileSelect = async (event: Event) => {
    console.log('📁 [MediaUploader] File selection triggered:', event)
    const target = event.target as HTMLInputElement
    console.log('📁 [MediaUploader] Selected files:', target.files)
    
    if (!target.files?.length) {
        console.log('📁 [MediaUploader] No files selected, returning')
        return
    }

    console.log('📁 [MediaUploader] Processing file selection:', {
        fileCount: target.files.length,
        multiple: props.multiple,
        files: Array.from(target.files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    })

    if (props.multiple) {
        console.log('📁 [MediaUploader] Multiple files mode - calling uploadFiles')
        await uploadFiles(Array.from(target.files))
    } else {
        const file = target.files[0]
        console.log('📁 [MediaUploader] Single file mode - calling uploadFile with:', file)
        if (file) {
            await uploadFile(file)
        }
    }
}

const handleDrop = async (event: DragEvent) => {
    console.log('🎯 [MediaUploader] File drop triggered:', event)
    event.preventDefault()
    if (dragging.value) {
        dragging.value = false
    }

    console.log('🎯 [MediaUploader] Dropped files:', event.dataTransfer?.files)
    if (!event.dataTransfer?.files.length) {
        console.log('🎯 [MediaUploader] No files in drop, returning')
        return
    }

    console.log('🎯 [MediaUploader] Processing file drop:', {
        fileCount: event.dataTransfer.files.length,
        multiple: props.multiple,
        files: Array.from(event.dataTransfer.files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    })

    if (props.multiple) {
        console.log('🎯 [MediaUploader] Multiple files mode - calling uploadFiles')
        await uploadFiles(Array.from(event.dataTransfer.files))
    } else {
        const file = event.dataTransfer.files[0]
        console.log('🎯 [MediaUploader] Single file mode - calling uploadFile with:', file)
        if (file) {
            await uploadFile(file)
        }
    }
}

// File removal functions
const removeFile = (index: number) => {
    if (index >= 0 && index < files.value.length) {
        files.value.splice(index, 1)
    }
}

const removeFileAtIndex = (index: number) => {
    removeFile(index)
}

const resetValidation = () => {
    errorHandler.clearErrors()
}

const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (!dragging.value) {
        dragging.value = true
    }
}

const handleDragLeave = () => {
    if (dragging.value) {
        dragging.value = false
    }
}

const getFileTypeSubtypes = (category: string) => {
    const types = {
        image: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
        svg: ['svg'],
        audio: ['mp3', 'aac', 'wav'],
        video: ['mp4', 'webm', 'mpeg', 'avi'],
        document: ['pdf', 'doc', 'docx'],
        archive: ['zip', '7z', 'rar', 'gz'],
    };
    return types[category as keyof typeof types] || [];
};

const formatFileSize = (bytes: number) => {
    return mediaFormatter.formatFileSize(bytes)
}

const getFileTypeIcon = (mimeType: string) => {
    return mediaFormatter.getFileIcon(mimeType)
}

const allowedTypesText = computed(() => {
    return props.allowedTypes.map(type => {
        const subtypes = getFileTypeSubtypes(type);
        return subtypes.map(subtype => subtype.toUpperCase()).join(', ');
    }).join(', ');
});
</script>

<template>
    <div class="space-y-2">
        <!-- Label -->
        <label
            v-if="label"
            :for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            {{ label }}
            <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>

        <!-- Upload Area -->
        <div
            :class="[
                'relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ease-in-out',
                'bg-card/50 backdrop-blur-sm shadow-premium',
                dragging ? 'border-solid border-primary bg-primary/10 shadow-premium-lg' : 'border-border hover:border-primary/50',
                errorHandler.isError.value ? 'border-destructive' : '',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'
            ]"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @click="!disabled && fileInputRef?.click()"
        >
            <!-- Single File Display -->
            <div v-if="!multiple && safeFiles.length > 0" class="space-y-4">
                <div class="flex items-center justify-center">
                    <div class="relative group">
                        <NuxtImg
                            v-if="safeFiles[0]"
                            :src="getDirectImageSrc(safeFiles[0])"
                            :alt="safeFiles[0].filename"
                            class="max-h-48 w-auto rounded-lg object-contain"
                        />
                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div class="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    @click.stop="fileInputRef?.click()"
                                >
                                    <Icon name="solar:refresh-outline" class="w-4 h-4 mr-2" />
                                    {{ t('media.replace') }}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    @click.stop="removeFile(0)"
                                >
                                    <Icon name="solar:trash-bin-minimalistic-outline" class="w-4 h-4 mr-2" />
                                    {{ t('media.remove') }}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Multiple Files Display -->
            <div v-else-if="multiple && safeFiles.length > 0" class="space-y-4">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div
                        v-for="(file, index) in safeFiles"
                        :key="file.id"
                        class="relative group hover-lift"
                    >
                        <div class="aspect-square overflow-hidden rounded-lg border border-border bg-card/50">
                            <NuxtImg
                                v-if="file.mimeType?.startsWith('image/')"
                                :src="getDirectImageSrc(file)"
                                :alt="file.filename"
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div v-else class="w-full h-full flex items-center justify-center bg-muted">
                                <Icon :name="getFileTypeIcon(file.mimeType || '')" class="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                class="btn-premium"
                                @click.stop="removeFileAtIndex(index)"
                            >
                                <Icon name="solar:trash-bin-minimalistic-outline" class="shrink-0 size-4" />
                            </Button>
                        </div>
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div class="bg-background/80 backdrop-blur-sm rounded-full p-1">
                                <Icon name="solar:close-circle-outline" class="w-4 h-4 text-destructive" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Icon name="solar:check-circle-outline" class="shrink-0 size-4 text-success" />
                    <span>{{ safeFiles.length }} {{ t('media.selected') }}</span>
                </div>
            </div>

            <!-- Error Display -->
            <MediaErrorDisplay
                v-if="errorHandler.isError.value"
                :errors="errorHandler.errors.value"
                @clear-all="errorHandler.clearErrors"
                @clear-validation="errorHandler.clearValidationErrors"
                @clear-upload="errorHandler.clearUploadErrors"
                @clear-permission="errorHandler.clearPermissionErrors"
            />

            <!-- Upload Prompt -->
            <div v-else class="text-center">
                <div v-if="loading.getLoadingState('single').isLoading || loading.getLoadingState('multiple').isLoading" class="space-y-4">
                    <div class="relative">
                        <Icon name="solar:upload-square-outline" class="w-12 h-12 mx-auto text-primary animate-pulse" />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Icon name="solar:refresh-outline" class="w-6 h-6 text-primary animate-spin" />
                        </div>
                    </div>
                    <p class="text-sm text-muted-foreground font-medium">
                        {{ loading.getLoadingState('single').message || loading.getLoadingState('multiple').message || t('media.uploading') }}
                    </p>
                </div>
                <div v-else class="space-y-4">
                    <div class="relative group">
                        <Icon name="solar:gallery-send-outline" class="w-12 h-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Icon name="solar:add-circle-outline" class="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm font-medium text-foreground">
                            {{ placeholder || t('media.upload_prompt') }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            {{ t('media.drag_drop_or_click') }}
                        </p>
                    </div>
                    <div class="text-xs text-muted-foreground space-y-1">
                        <p class="flex items-center gap-1">
                            <Icon name="solar:file-text-outline" class="shrink-0 size-3" />
                            <span class="font-medium">{{ t('media.allowed_types') }}:</span>
                            {{ allowedTypesText }}
                        </p>
                        <p class="flex items-center gap-1">
                            <Icon name="solar:hard-drive-outline" class="shrink-0 size-3" />
                            <span class="font-medium">{{ t('media.max_size') }}:</span>
                            {{ maxSize }}MB
                        </p>
                        <p v-if="multiple" class="flex items-center gap-1">
                            <Icon name="solar:files-outline" class="shrink-0 size-3" />
                            <span class="font-medium">{{ t('media.max_files') }}:</span>
                            {{ maxFiles }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Hidden File Input -->
            <input
                ref="fileInputRef"
                :id="name"
                :name="name"
                :multiple="multiple"
                type="file"
                class="sr-only"
                :accept="allowedTypes.map(type => getFileTypeSubtypes(type).map(subtype => `.${subtype}`).join(',')).join(',')"
                @change="handleFileSelect"
            >
        </div>

        <!-- Error Messages are handled by MediaErrorDisplay component -->
    </div>
</template>


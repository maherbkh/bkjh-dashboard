import type { MediaFile, MediaUploadOptions, MediaValidationRules } from '~/types/media';
import { useUserStore } from '~/stores/user';

interface UseMediaUploaderOptions {
    modelValue: Ref<MediaFile | MediaFile[] | null>;
    maxFiles: Ref<number>;
    maxSize: Ref<number>;
    allowedTypes: Ref<string[]>;
    accessLevel: Ref<'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC'>;
    collectionName: Ref<string>;
    modelType: Ref<string>;
    modelId: Ref<string>;
    directory: Ref<string>;
    onUploadSuccess?: (file: MediaFile) => void;
    onUploadError?: (error: string) => void;
    onUploadStart?: () => void;
}

export function useMediaUploader(options: UseMediaUploaderOptions) {
    const { t } = useI18n();
    const userStore = useUserStore();

    // Reactive state - ensure they are always defined
    const files = ref<MediaFile[]>([]);
    const uploading = ref(false);
    const dragging = ref(false);
    const validationErrors = ref<string[]>([]);

    // Initialize files from modelValue if provided
    if (options.modelValue.value) {
        if (Array.isArray(options.modelValue.value)) {
            files.value = options.modelValue.value;
        } else {
            files.value = [options.modelValue.value];
        }
    }

    // File type configurations
    const fileTypeConfig: Record<string, MediaValidationRules> = {
        image: {
            maxSize: 10,
            maxFiles: 50,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            deniedTypes: ['image/svg+xml'],
        },
        svg: {
            maxSize: 5,
            maxFiles: 10,
            allowedTypes: ['image/svg+xml'],
            deniedTypes: [],
        },
        audio: {
            maxSize: 50,
            maxFiles: 20,
            allowedTypes: ['audio/mpeg', 'audio/aac', 'audio/wav'],
            deniedTypes: [],
        },
        video: {
            maxSize: 100,
            maxFiles: 10,
            allowedTypes: ['video/mp4', 'video/webm', 'video/mpeg', 'video/x-msvideo'],
            deniedTypes: [],
        },
        document: {
            maxSize: 25,
            maxFiles: 20,
            allowedTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
            deniedTypes: [],
        },
        archive: {
            maxSize: 50,
            maxFiles: 5,
            allowedTypes: ['application/zip', 'application/x-7z-compressed', 'application/gzip', 'application/vnd.rar'],
            deniedTypes: [],
        },
    };

    // Globally denied types
    const globallyDeniedTypes = [
        'text/html',
        'application/javascript',
        'text/javascript',
        'application/x-msdownload',
        'application/java-archive',
        'application/x-sh',
        'application/x-dosexec',
        'application/wasm',
        'application/x-php',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/gzip',
        'application/x-tar',
        'application/x-apple-diskimage',
    ];

    // Initialize files from modelValue
    watch(() => options.modelValue.value, (newValue) => {
        if (Array.isArray(newValue)) {
            files.value = newValue;
        } else if (newValue) {
            files.value = [newValue];
        } else {
            files.value = [];
        }
    }, { immediate: true });

    // Validation functions
    const validateFile = (file: File): string[] => {
        const errors: string[] = [];

        // Check globally denied types
        if (globallyDeniedTypes.includes(file.type)) {
            errors.push(t('media.validation.globally_denied', { type: file.type }));
            return errors;
        }

        // Check file size
        const maxSizeBytes = options.maxSize.value * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            errors.push(t('media.validation.size_exceeded', { 
                size: Math.round(file.size / 1024 / 1024),
                max: options.maxSize.value 
            }));
        }

        // Check allowed types
        const allowedMimeTypes = options.allowedTypes.value.flatMap(type => 
            fileTypeConfig[type]?.allowedTypes || []
        );

        if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
            errors.push(t('media.validation.type_not_allowed', { 
                type: file.type,
                allowed: allowedMimeTypes.join(', ')
            }));
        }

        // Check denied types for each allowed type
        options.allowedTypes.value.forEach(type => {
            const config = fileTypeConfig[type];
            if (config?.deniedTypes.includes(file.type)) {
                errors.push(t('media.validation.type_denied', { type: file.type }));
            }
        });

        // SVG security check
        if (file.type === 'image/svg+xml' && !userStore.user?.isSuperAdmin) {
            errors.push(t('media.validation.svg_superadmin_only'));
        }

        return errors;
    };

    const validateFiles = (fileList: File[]): string[] => {
        const errors: string[] = [];

        // Check file count
        if (fileList.length > options.maxFiles.value) {
            errors.push(t('media.validation.too_many_files', { 
                count: fileList.length,
                max: options.maxFiles.value 
            }));
        }

        // Validate each file
        fileList.forEach(file => {
            const fileErrors = validateFile(file);
            errors.push(...fileErrors);
        });

        return errors;
    };

    const resetValidation = () => {
        validationErrors.value = [];
    };

    // Upload functions
    const uploadFile = async (file: File): Promise<void> => {
        const errors = validateFile(file);
        if (errors.length > 0) {
            validationErrors.value = errors;
            options.onUploadError?.(errors[0] || 'Validation error');
            return;
        }

        resetValidation();
        uploading.value = true;
        options.onUploadStart?.();

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('accessLevel', options.accessLevel.value.toUpperCase());
            formData.append('collectionName', options.collectionName.value);
            formData.append('directory', options.directory.value);
            
            if (options.modelType.value) {
                formData.append('modelType', options.modelType.value);
            }
            if (options.modelId.value) {
                formData.append('modelId', options.modelId.value);
            }

            const { data, error } = await useApiFetch('/shared/media/upload', {
                method: 'POST',
                body: formData,
            });

            if (error.value) {
                throw new Error(error.value.message || t('media.upload_error'));
            }

            if (data.value?.data) {
                const uploadedFile = data.value.data;
                files.value = [uploadedFile];
                options.onUploadSuccess?.(uploadedFile);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('media.upload_error');
            validationErrors.value = [errorMessage];
            options.onUploadError?.(errorMessage);
        } finally {
            uploading.value = false;
        }
    };

    const uploadFiles = async (fileList: File[]): Promise<void> => {
        const errors = validateFiles(fileList);
        if (errors.length > 0) {
            validationErrors.value = errors;
            options.onUploadError?.(errors[0] || 'Validation error');
            return;
        }

        resetValidation();
        uploading.value = true;
        options.onUploadStart?.();

        try {
            const formData = new FormData();
            fileList.forEach(file => {
                formData.append('files', file);
            });
            formData.append('accessLevel', options.accessLevel.value.toUpperCase());
            formData.append('collectionName', options.collectionName.value);
            formData.append('directory', options.directory.value);
            formData.append('maxFiles', options.maxFiles.value.toString());
            
            if (options.modelType.value) {
                formData.append('modelType', options.modelType.value);
            }
            if (options.modelId.value) {
                formData.append('modelId', options.modelId.value);
            }

            const { data, error } = await useApiFetch('/shared/media/upload-many', {
                method: 'POST',
                body: formData,
            });

            if (error.value) {
                throw new Error(error.value.message || t('media.upload_error'));
            }

            if (data.value?.data?.successful) {
                const uploadedFiles = data.value.data.successful;
                files.value = [...files.value, ...uploadedFiles];
                uploadedFiles.forEach((file: MediaFile) => options.onUploadSuccess?.(file));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('media.upload_error');
            validationErrors.value = [errorMessage];
            options.onUploadError?.(errorMessage);
        } finally {
            uploading.value = false;
        }
    };

    // File management
    const removeFile = (index: number): void => {
        if (index >= 0 && index < files.value.length) {
            files.value.splice(index, 1);
        }
    };

    const removeFileAtIndex = (index: number): void => {
        removeFile(index);
    };

    return {
        files,
        uploading,
        dragging,
        validationErrors,
        uploadFile,
        uploadFiles,
        removeFile,
        removeFileAtIndex,
        validateFile,
        validateFiles,
        resetValidation,
    };
}

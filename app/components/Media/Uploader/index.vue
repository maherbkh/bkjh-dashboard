<script setup lang="ts">
import type { MediaFile, MediaUploadOptions } from '~/types/media';
import { useMediaUploader } from '~/composables/useMediaUploader';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';

interface Props {
    modelValue?: MediaFile | MediaFile[] | null;
    label?: string;
    name?: string;
    required?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in MB
    allowedTypes?: string[];
    accessLevel?: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    collectionName?: 'avatar' | 'cover' | 'gallery' | 'attachments' | 'documents' | 'default';
    modelType?: string;
    modelId?: string;
    directory?: string;
    errors?: string[];
    disabled?: boolean;
    placeholder?: string;
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
    accessLevel: 'PUBLIC',
    collectionName: '',
    modelType: '',
    modelId: '',
    directory: 'shared',
    errors: () => [],
    disabled: false,
    placeholder: '',
});

const emit = defineEmits<{
    'update:modelValue': [value: MediaFile | MediaFile[] | null];
    'upload:start': [];
    'upload:success': [file: MediaFile];
    'upload:error': [error: string];
}>();

const { t } = useI18n();
const { getImageSrc } = useAuthenticatedImage();

// Template refs
const fileInputRef = ref<HTMLInputElement>();

// Ensure files is always an array
const safeFiles = computed(() => {
    if (!files) return [];
    if (files.value && Array.isArray(files.value)) return files.value;
    if (Array.isArray(files)) return files;
    return [];
});

const mediaUploader = useMediaUploader({
    modelValue: toRef(props, 'modelValue'),
    maxFiles: toRef(props, 'maxFiles'),
    maxSize: toRef(props, 'maxSize'),
    allowedTypes: toRef(props, 'allowedTypes'),
    accessLevel: toRef(props, 'accessLevel'),
    collectionName: toRef(props, 'collectionName'),
    modelType: toRef(props, 'modelType'),
    modelId: toRef(props, 'modelId'),
    directory: toRef(props, 'directory'),
    onUploadSuccess: (file) => emit('upload:success', file),
    onUploadError: (error) => emit('upload:error', error),
    onUploadStart: () => emit('upload:start'),
});

// Destructure with fallbacks
const files = mediaUploader.files || ref<MediaFile[]>([]);
const uploading = mediaUploader.uploading || ref(false);
const dragging = mediaUploader.dragging || ref(false);
const validationErrors = mediaUploader.validationErrors || ref<string[]>([]);
const uploadFile = mediaUploader.uploadFile || (() => {});
const uploadFiles = mediaUploader.uploadFiles || (() => {});
const removeFile = mediaUploader.removeFile || (() => {});
const removeFileAtIndex = mediaUploader.removeFileAtIndex || (() => {});
const validateFile = mediaUploader.validateFile || (() => false);
const validateFiles = mediaUploader.validateFiles || (() => false);
const resetValidation = mediaUploader.resetValidation || (() => {});

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
    if (newValue !== safeFiles.value && files) {
        if (Array.isArray(newValue)) {
            files.value = newValue;
        } else if (newValue) {
            files.value = [newValue];
        } else {
            files.value = [];
        }
    }
});

// Watch for files changes and emit
watch(safeFiles, (newFiles) => {
    if (props.multiple) {
        emit('update:modelValue', [...newFiles]);
    } else {
        emit('update:modelValue', newFiles.length > 0 ? newFiles[0] : null);
    }
}, { deep: true });

const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;

    if (props.multiple) {
        await uploadFiles(Array.from(target.files));
    } else {
        const file = target.files[0];
        if (file) {
            await uploadFile(file);
        }
    }
};

const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    if (dragging.value) {
        dragging.value = false;
    }

    if (!event.dataTransfer?.files.length) return;

    if (props.multiple) {
        await uploadFiles(Array.from(event.dataTransfer.files));
    } else {
        const file = event.dataTransfer.files[0];
        if (file) {
            await uploadFile(file);
        }
    }
};

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!dragging.value) {
        dragging.value = true;
    }
};

const handleDragLeave = () => {
    if (dragging.value) {
        dragging.value = false;
    }
};

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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileTypeIcon = (mimeType: string) => {
    if (!mimeType) return 'solar:file-outline';
    
    const type = mimeType.toLowerCase();
    
    // Document types
    if (type.includes('pdf')) return 'solar:document-outline';
    if (type.includes('word') || type.includes('doc')) return 'solar:document-text-outline';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'solar:chart-outline';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'solar:presentation-graph-outline';
    if (type.includes('text/plain')) return 'solar:document-text-outline';
    if (type.includes('rtf')) return 'solar:document-outline';
    
    // Audio types
    if (type.includes('audio/')) return 'solar:music-note-outline';
    
    // Video types
    if (type.includes('video/')) return 'solar:video-camera-outline';
    
    // Archive types
    if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar') || type.includes('gz')) {
        return 'solar:archive-outline';
    }
    
    // Code files
    if (type.includes('javascript') || type.includes('typescript')) return 'solar:code-outline';
    if (type.includes('json')) return 'solar:code-2-outline';
    if (type.includes('html')) return 'solar:code-square-outline';
    if (type.includes('css')) return 'solar:palette-outline';
    if (type.includes('xml')) return 'solar:code-outline';
    
    // Database files
    if (type.includes('sql')) return 'solar:database-outline';
    
    // Spreadsheet files
    if (type.includes('csv')) return 'solar:chart-outline';
    
    // Default file icon
    return 'solar:file-outline';
};

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
                validationErrors.length > 0 || errors.length > 0 ? 'border-destructive' : '',
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
                            v-if="safeFiles[0]?.fullUrl || safeFiles[0]?.url"
                            :src="getImageSrc(safeFiles[0])"
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
                                v-if="file.mimeType?.startsWith('image/') && (file.fullUrl || file.url)"
                                :src="getImageSrc(file)"
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

            <!-- Upload Prompt -->
            <div v-else class="text-center">
                <div v-if="uploading" class="space-y-4">
                    <div class="relative">
                        <Icon name="solar:upload-square-outline" class="w-12 h-12 mx-auto text-primary animate-pulse" />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Icon name="solar:refresh-outline" class="w-6 h-6 text-primary animate-spin" />
                        </div>
                    </div>
                    <p class="text-sm text-muted-foreground font-medium">
                        {{ t('media.uploading') }}
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

        <!-- Error Messages -->
        <div v-if="validationErrors.length > 0 || errors.length > 0" class="space-y-1">
            <p
                v-for="error in [...validationErrors, ...errors]"
                :key="error"
                class="text-sm text-red-600 dark:text-red-400"
            >
                {{ error }}
            </p>
        </div>
    </div>
</template>

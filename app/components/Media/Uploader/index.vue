<script setup lang="ts">
import type { MediaEntity, AccessLevel, CollectionType } from '~/types/media/index';
import { AccessLevel as AccessLevelEnum, CollectionType as CollectionTypeEnum } from '~/types/media/index';
import { useMediaRepository, useMediaPermissions, useMediaErrorHandler, useMediaLoading } from '~/composables/media';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';
import { mediaValidator, mediaFormatter } from '~/services/media';
import MediaErrorDisplay from '~/components/Media/molecules/MediaErrorDisplay.vue';

interface Props {
    modelValue?: MediaEntity | MediaEntity[] | null;
    label?: string;
    name?: string;
    required?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in MB
    allowedTypes?: string[];
    accessLevel?: AccessLevel;
    collectionName?: CollectionType;
    modelType?: string;
    modelId?: string;
    directory?: string;
    errors?: string[];
    disabled?: boolean;
    placeholder?: string;
    showGallery?: boolean;
    logo?: boolean;
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
    showGallery: false,
    logo: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: MediaEntity | MediaEntity[] | null];
    'upload:start': [];
    'upload:success': [file: MediaEntity];
    'upload:error': [error: string];
    'open-gallery': [];
}>();

const { t } = useI18n();
const { getDirectImageSrc } = useAuthenticatedImage();

// Use new composables
const repository = useMediaRepository();
const permissions = useMediaPermissions();
const errorHandler = useMediaErrorHandler();
const loading = useMediaLoading();

// Template refs
const fileInputRef = ref<HTMLInputElement>();

// State management
const files = ref<MediaEntity[]>([]);
const dragging = ref(false);

// Ensure files is always an array
const safeFiles = computed(() => {
    if (!files.value || files.value.length === 0) return [];
    return Array.isArray(files.value) ? files.value : [files.value];
});

// Watch for modelValue changes
watch(() => props.modelValue, (newValue: MediaEntity | MediaEntity[] | null) => {
    // Always update files when modelValue changes
    if (Array.isArray(newValue)) {
        files.value = newValue;
    }
    else if (newValue) {
        // Single MediaEntity - wrap in array for consistency
        files.value = [newValue];
    }
    else {
        files.value = [];
    }
}, { immediate: true, deep: true });

// Watch for files changes and emit
watch(safeFiles, (newFiles: MediaEntity[]) => {
    if (props.multiple) {
        emit('update:modelValue', [...newFiles]);
    }
    else {
        emit('update:modelValue', newFiles.length > 0 ? newFiles[0] as MediaEntity : null);
    }
}, { deep: true });

// Upload functions using new architecture
const uploadFile = async (file: File) => {
    loading.startUpload('single');
    errorHandler.clearErrors();

    try {
        // Validate file
        const validation = mediaValidator.validateFile(file, 'dashboard');

        if (!validation.isValid) {
            validation.errors.forEach(error => errorHandler.addValidationError(error));
            emit('upload:error', validation.errors.join(', '));
            return;
        }

        // Check permissions
        if (!permissions.canUpload.value) {
            const error = 'You do not have permission to upload files';
            errorHandler.addPermissionError(error);
            emit('upload:error', error);
            return;
        }

        emit('upload:start');

        // Upload file
        const result = await repository.create(file, {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory,
        });

        // Add to files array
        const newFile = result as MediaEntity;

        if (props.multiple) {
            files.value = [...files.value, newFile];
        }
        else {
            files.value = [newFile];
        }

        emit('upload:success', newFile);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        errorHandler.addUploadError(errorMessage, 'UPLOAD_FAILED', error);
        emit('upload:error', errorMessage);
    }
    finally {
        loading.finishUpload('single');
    }
};

const uploadFiles = async (fileList: File[]) => {
    try {
        // Validate files
        const validation = mediaValidator.validateFiles(fileList, 'dashboard');

        if (!validation.isValid) {
            validation.errors.forEach(error => errorHandler.addValidationError(error));
            emit('upload:error', validation.errors.join(', '));
            return;
        }

        // Check permissions
        if (!permissions.canUpload.value) {
            const error = 'You do not have permission to upload files';
            errorHandler.addPermissionError(error);
            emit('upload:error', error);
            return;
        }

        loading.startUpload('multiple');
        emit('upload:start');

        // Upload files
        const result = await repository.createMany(fileList, {
            accessLevel: props.accessLevel,
            collectionName: props.collectionName,
            modelType: props.modelType,
            modelId: props.modelId,
            directory: props.directory,
        });

        // Add successful uploads to files array
        const newFiles = result.successful as MediaEntity[];

        if (props.multiple) {
            files.value = [...files.value, ...newFiles];
        }
        else if (newFiles.length > 0) {
            files.value = [newFiles[0]!];
        }

        if (newFiles.length > 0) {
            emit('upload:success', newFiles[0]!);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        errorHandler.addUploadError(errorMessage, 'UPLOAD_FAILED', error);
        emit('upload:error', errorMessage);
    }
    finally {
        loading.finishUpload('multiple');
    }
};

const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (!target.files?.length) {
        return;
    }

    if (props.multiple) {
        await uploadFiles(Array.from(target.files));
    }
    else {
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

    if (!event.dataTransfer?.files.length) {
        return;
    }

    if (props.multiple) {
        await uploadFiles(Array.from(event.dataTransfer.files));
    }
    else {
        const file = event.dataTransfer.files[0];
        if (file) {
            await uploadFile(file);
        }
    }
};

// File removal functions
const removeFile = (index: number) => {
    if (index >= 0 && index < files.value.length) {
        files.value.splice(index, 1);
    }
};

const removeFileAtIndex = (index: number) => {
    removeFile(index);
};

const resetValidation = () => {
    errorHandler.clearErrors();
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
    return mediaFormatter.formatFileSize(bytes);
};

const getFileTypeIcon = (mimeType: string) => {
    return mediaFormatter.getFileIcon(mimeType);
};

const allowedTypesText = computed(() => {
    return props.allowedTypes.map((type) => {
        const subtypes = getFileTypeSubtypes(type);
        return subtypes.map(subtype => subtype.toUpperCase()).join(', ');
    }).join(', ');
});
</script>

<template>
    <div class="space-y-2 flex flex-col">
        <!-- Label -->
        <label
            v-if="label"
            :for="name"
            class="block text-sm font-medium text-foreground"
        >
            {{ label }}
            <span
                v-if="required"
                class="text-destructive ml-1"
            >*</span>
        </label>

        <!-- Compact preview when single file is present (no dashed drop zone) -->
        <div
            v-if="!multiple && safeFiles.length > 0"
            :class="[
                'relative rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-3 p-3 h-[8rem]',
                'bg-card/50 border-border hover:border-primary/30',
                errorHandler.isError.value ? 'border-destructive' : '',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @click="!disabled && fileInputRef?.click()"
        >
            <div class="relative group shrink-0 flex justify-center sm:justify-start">
                <NuxtImg
                    v-if="safeFiles[0]"
                    :src="getDirectImageSrc(safeFiles[0])"
                    :alt="safeFiles[0].filename || safeFiles[0].title || 'Preview'"
                    :class="[
                        'h-20 w-20 sm:h-24 sm:w-24 rounded-lg ring-1 ring-border',
                        logo ? 'object-contain bg-white' : 'object-cover',
                    ]"
                />
                <div class="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        class="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                        :aria-label="t('media.replace')"
                        @click.stop="fileInputRef?.click()"
                    >
                        <Icon
                            name="solar:refresh-outline"
                            class="size-4"
                        />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        class="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                        :aria-label="t('media.remove')"
                        @click.stop="removeFile(0)"
                    >
                        <Icon
                            name="solar:trash-bin-minimalistic-outline"
                            class="size-4"
                        />
                    </Button>
                </div>
            </div>
            <p class="text-xs text-muted-foreground flex-1 hidden sm:block">
                {{ t('media.drop_or_browse') }}
            </p>
            <input
                :id="name"
                ref="fileInputRef"
                :name="name"
                :multiple="multiple"
                type="file"
                class="sr-only"
                :accept="allowedTypes.map(type => getFileTypeSubtypes(type).map(subtype => `.${subtype}`).join(',')).join(',')"
                @change="handleFileSelect"
            >
        </div>

        <!-- Drop zone: empty state, multiple files, or errors -->
        <div
            v-else
            :class="[
                'relative border-2 border-dashed rounded-xl p-3 sm:p-4 transition-all duration-300 ease-in-out flex flex-col h-[8rem]',
                'bg-card/50',
                dragging ? 'border-solid border-primary bg-primary/10' : 'border-border hover:border-primary/40',
                errorHandler.isError.value ? 'border-destructive' : '',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @click="!disabled && fileInputRef?.click()"
        >
            <!-- Multiple Files Display -->
            <div
                v-if="multiple && safeFiles.length > 0"
                class="space-y-3"
            >
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div
                        v-for="(file, index) in safeFiles"
                        :key="file.id"
                        class="relative group"
                    >
                        <div class="aspect-square overflow-hidden rounded-lg border border-border bg-card/50">
                            <NuxtImg
                                v-if="file.mimeType?.startsWith('image/')"
                                :src="getDirectImageSrc(file)"
                                :alt="file.filename"
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center bg-muted"
                            >
                                <Icon
                                    :name="getFileTypeIcon(file.mimeType || '')"
                                    class="w-8 h-8 text-muted-foreground"
                                />
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
                                <Icon
                                    name="solar:trash-bin-minimalistic-outline"
                                    class="shrink-0 size-4"
                                />
                            </Button>
                        </div>
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div class="bg-background/80 backdrop-blur-sm rounded-full p-1">
                                <Icon
                                    name="solar:close-circle-outline"
                                    class="w-4 h-4 text-destructive"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Icon
                        name="solar:check-circle-outline"
                        class="shrink-0 size-4 text-success"
                    />
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

            <!-- Upload Prompt (empty state) -->
            <div
                v-else
                class="flex flex-1 min-h-0 flex-col items-center justify-center text-center py-1"
            >
                <div
                    v-if="loading.getLoadingState('single').isLoading || loading.getLoadingState('multiple').isLoading"
                    class="space-y-2 py-2"
                >
                    <div class="relative">
                        <Icon
                            name="solar:upload-square-outline"
                            class="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary animate-pulse"
                        />
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Icon
                                name="solar:refresh-outline"
                                class="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-spin"
                            />
                        </div>
                    </div>
                    <p class="text-sm text-muted-foreground font-medium">
                        {{ loading.getLoadingState('single').message || loading.getLoadingState('multiple').message || t('media.uploading') }}
                    </p>
                </div>
                <div
                    v-else
                    class="space-y-2 py-1"
                >
                    <div class="relative group">
                        <Icon
                            name="solar:gallery-send-outline"
                            class="w-8 h-8 sm:w-9 sm:h-9 mx-auto text-muted-foreground group-hover:text-primary transition-colors duration-200"
                        />
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Icon
                                name="solar:add-circle-outline"
                                class="w-6 h-6 sm:w-7 sm:h-7 text-primary"
                            />
                        </div>
                    </div>
                    <p class="text-sm font-medium text-foreground">
                        {{ placeholder || t('media.drop_or_browse') }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                        {{ t('media.pick_file_up_to', { max: maxSize }) }}
                    </p>
                </div>
            </div>

            <input
                :id="name"
                ref="fileInputRef"
                :name="name"
                :multiple="multiple"
                type="file"
                class="sr-only"
                :accept="allowedTypes.map(type => getFileTypeSubtypes(type).map(subtype => `.${subtype}`).join(',')).join(',')"
                @change="handleFileSelect"
            >
        </div>

        <!-- Footer: Open Gallery -->
        <div
            v-if="showGallery"
            class="pt-2 grid grid-cols-1"
        >
            <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                @click="emit('open-gallery')"
            >
                <Icon
                    name="solar:folder-open-outline"
                    class="size-4 mr-1.5"
                />
                {{ t('media.open_gallery') }}
            </Button>
        </div>

        <!-- Error Messages are handled by MediaErrorDisplay component -->
    </div>
</template>

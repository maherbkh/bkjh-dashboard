<script setup lang="ts">
import type { MediaFile } from '~/types/media';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';

interface Props {
    id?: string;
    name?: string;
    label?: string;
    required?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string[];
    accessLevel?: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    collectionName?: 'avatar' | 'cover' | 'gallery' | 'attachments' | 'documents' | 'default';
    modelType?: string;
    modelId?: string;
    directory?: string;
    errors?: string[];
    disabled?: boolean;
    placeholder?: string;
    showManager?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    id: '',
    name: '',
    label: '',
    required: false,
    multiple: false,
    maxFiles: 1,
    maxSize: 10,
    allowedTypes: () => ['image'],
    accessLevel: 'PUBLIC',
    collectionName: '',
    modelType: '',
    modelId: '',
    directory: 'shared',
    errors: () => [],
    disabled: false,
    placeholder: '',
    showManager: true,
});

const emit = defineEmits<{
    'update:modelValue': [value: MediaFile | MediaFile[] | null];
}>();

const { t } = useI18n();

// Reactive state
const modelValue = ref<MediaFile | MediaFile[] | null>(null);
const showManagerDialog = ref(false);
const { getImageSrc } = useAuthenticatedImage();

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
    modelValue.value = newValue;
}, { immediate: true });

// Watch for internal modelValue changes and emit
watch(modelValue, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

const handleUploadSuccess = (file: MediaFile) => {
    if (props.multiple) {
        const currentFiles = Array.isArray(modelValue.value) ? modelValue.value : [];
        modelValue.value = [...currentFiles, file];
    } else {
        modelValue.value = file;
    }
};

const handleManagerSelect = (files: MediaFile[]) => {
    if (props.multiple) {
        modelValue.value = files;
    } else {
        modelValue.value = files[0] || null;
    }
    showManagerDialog.value = false;
};

const openManager = () => {
    showManagerDialog.value = true;
};

const removeFile = (index?: number) => {
    if (props.multiple && Array.isArray(modelValue.value)) {
        if (typeof index === 'number') {
            modelValue.value.splice(index, 1);
        } else {
            modelValue.value = [];
        }
    } else {
        modelValue.value = null;
    }
};

const getFileDisplayName = (file: MediaFile) => {
    return file.filename || file.title || 'Unknown file';
};

const getFileSize = (file: MediaFile) => {
    if (!file.size) return '';
    const bytes = file.size;
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
</script>

<template>
    <div class="space-y-2">
        <!-- Label -->
        <label
            v-if="label"
            :for="id"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            {{ label }}
            <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>

        <!-- Media Uploader -->
        <MediaUploader
            :model-value="modelValue"
            :name="name"
            :required="required"
            :multiple="multiple"
            :max-files="maxFiles"
            :max-size="maxSize"
            :allowed-types="allowedTypes"
            :access-level="accessLevel"
            :collection-name="collectionName"
            :model-type="modelType"
            :model-id="modelId"
            :directory="directory"
            :errors="errors"
            :disabled="disabled"
            :placeholder="placeholder"
            @update:model-value="modelValue = $event"
            @upload:success="handleUploadSuccess"
        />

        <!-- Media Manager Button -->
        <div v-if="showManager" class="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                @click="openManager"
            >
                <Icon name="solar:folder-open-outline" class="w-4 h-4 mr-2" />
                {{ t('media.open_gallery') }}
            </Button>
        </div>

        <!-- Selected Files Display -->
        <div v-if="modelValue && (Array.isArray(modelValue) ? modelValue.length > 0 : true)" class="space-y-3">
            <div class="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon name="solar:check-circle-outline" class="shrink-0 size-4 text-success" />
                <span>{{ t('media.selected_files') }}:</span>
            </div>
            
            <!-- Single File Display -->
            <div v-if="!multiple && modelValue" class="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-premium hover-lift">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <NuxtImg
                            v-if="modelValue.mimeType?.startsWith('image/')"
                            :src="getImageSrc(modelValue)"
                            :alt="getFileDisplayName(modelValue)"
                            class="w-12 h-12 object-cover rounded-lg border border-border"
                        />
                        <div v-else class="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                            <Icon :name="getFileTypeIcon(modelValue.mimeType || '')" class="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div class="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                            <Icon name="solar:check-circle-bold" class="w-3 h-3 text-success-foreground" />
                        </div>
                    </div>
                    <div>
                        <div class="font-medium text-sm text-foreground">{{ getFileDisplayName(modelValue) }}</div>
                        <div class="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="solar:hard-drive-outline" class="shrink-0 size-3" />
                            <span>{{ getFileSize(modelValue) }}</span>
                        </div>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    :disabled="disabled"
                    @click="removeFile()"
                >
                    <Icon name="solar:trash-bin-minimalistic-outline" class="w-4 h-4" />
                </Button>
            </div>

            <!-- Multiple Files Display -->
            <div v-else-if="multiple && Array.isArray(modelValue) && modelValue.length > 0" class="space-y-3">
                <div
                    v-for="(file, index) in modelValue"
                    :key="file.id"
                    class="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-premium hover-lift"
                >
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <NuxtImg
                                v-if="file.mimeType?.startsWith('image/')"
                                :src="getImageSrc(file)"
                                :alt="getFileDisplayName(file)"
                                class="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                            <div v-else class="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center">
                                <Icon :name="getFileTypeIcon(file.mimeType || '')" class="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                                <Icon name="solar:check-circle-bold" class="w-3 h-3 text-success-foreground" />
                            </div>
                        </div>
                        <div>
                            <div class="font-medium text-sm text-foreground">{{ getFileDisplayName(file) }}</div>
                            <div class="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="solar:hard-drive-outline" class="shrink-0 size-3" />
                                <span>{{ getFileSize(file) }}</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        :disabled="disabled"
                        @click="removeFile(index)"
                    >
                        <Icon name="solar:trash-bin-minimalistic-outline" class="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="space-y-1">
            <p
                v-for="error in errors"
                :key="error"
                class="text-sm text-red-600 dark:text-red-400"
            >
                {{ error }}
            </p>
        </div>

        <!-- Media Manager Dialog -->
        <MediaManager
            v-model:open="showManagerDialog"
            :multiple="multiple"
            :max-selection="maxFiles"
            :allowed-types="allowedTypes"
            :access-level="accessLevel"
            :collection-name="collectionName"
            :model-type="modelType"
            :model-id="modelId"
            :selected-files="Array.isArray(modelValue) ? modelValue : modelValue ? [modelValue] : []"
            @update:selected-files="handleManagerSelect"
        />
    </div>
</template>

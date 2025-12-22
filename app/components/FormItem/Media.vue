<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { MediaEntity, AccessLevel, CollectionType } from '~/types/media/index';
import { AccessLevel as AccessLevelEnum, CollectionType as CollectionTypeEnum } from '~/types/media/index';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';
import { mediaFormatter } from '~/services/media';

interface Props {
    id?: string;
    name?: string;
    label?: string;
    modelValue?: MediaEntity | MediaEntity[] | null;
    required?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    allowedTypes?: string[];
    accessLevel?: AccessLevel;
    collectionName?: CollectionType;
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
    modelValue: null,
    required: false,
    multiple: false,
    maxFiles: 1,
    maxSize: 10,
    allowedTypes: () => ['image'],
    accessLevel: AccessLevelEnum.PUBLIC,
    collectionName: CollectionTypeEnum.DEFAULT,
    modelType: '',
    modelId: '',
    directory: 'shared',
    errors: () => [],
    disabled: false,
    placeholder: '',
    showManager: true,
});

const emit = defineEmits<{
    'update:modelValue': [value: MediaEntity | MediaEntity[] | null];
    'upload:success': [file: MediaEntity];
}>();

const { t } = useI18n();

// Reactive state
const showManagerDialog = ref(false);
const { getImageSrc, getDirectImageSrc } = useAuthenticatedImage();

const handleUploadSuccess = (file: MediaEntity) => {
    if (props.multiple) {
        const currentFiles = Array.isArray(props.modelValue) ? props.modelValue : [];
        emit('update:modelValue', [...currentFiles, file]);
    }
    else {
        emit('update:modelValue', file);
    }
    emit('upload:success', file);
};

const handleManagerSelect = (files: MediaEntity[]) => {
    console.log('🟢 [FormItem/Media] handleManagerSelect called (from @update:selected-files)', {
        files,
        filesCount: files.length,
        multiple: props.multiple,
        currentModelValue: props.modelValue,
    });

    if (props.multiple) {
        console.log('🟢 [FormItem/Media] Updating modelValue with multiple files:', files);
        emit('update:modelValue', files);
    }
    else {
        const selectedFile = files[0] || null;
        console.log('🟢 [FormItem/Media] Updating modelValue with single file:', selectedFile);
        emit('update:modelValue', selectedFile);
    }
    showManagerDialog.value = false;
    console.log('🟢 [FormItem/Media] Dialog closed, new modelValue:', props.modelValue);
};

const handleManagerSelectFromSelectEvent = (selection: MediaEntity | MediaEntity[] | string | string[]) => {
    console.log('🟡 [FormItem/Media] handleManagerSelectFromSelectEvent called (from @select)', {
        selection,
        selectionType: typeof selection,
        isArray: Array.isArray(selection),
        multiple: props.multiple,
        currentModelValue: props.modelValue,
    });

    // Handle the 'select' event which emits IDs for single selection or full objects for multiple
    // Note: For single selection, MediaManager emits just the ID, so we rely on @update:selected-files
    // for the full object. This handler primarily handles multiple selection with full objects.
    if (props.multiple) {
        if (Array.isArray(selection) && selection.length > 0 && typeof selection[0] === 'object') {
            console.log('🟡 [FormItem/Media] Updating modelValue with multiple files from @select:', selection);
            emit('update:modelValue', selection as MediaEntity[]);
            showManagerDialog.value = false;
        }
        else {
            console.warn('🟡 [FormItem/Media] Multiple selection but invalid format:', selection);
        }
    }
    else {
        // For single selection, MediaManager emits just the ID (string)
        // We skip handling it here and let @update:selected-files handle it with the full object
        // But if we somehow get a full object, handle it
        if (typeof selection === 'object' && !Array.isArray(selection)) {
            console.log('🟡 [FormItem/Media] Updating modelValue with single file from @select:', selection);
            emit('update:modelValue', selection as MediaEntity);
            showManagerDialog.value = false;
        }
        else if (typeof selection === 'string') {
            console.log('🟡 [FormItem/Media] Received ID string, waiting for @update:selected-files to provide full object:', selection);
        }
        // If it's a string (ID), we don't have the full object, so skip and let update:selected-files handle it
    }
};

const openManager = () => {
    showManagerDialog.value = true;
};

const removeFile = (index?: number) => {
    if (props.multiple && Array.isArray(props.modelValue)) {
        const files = [...props.modelValue];
        if (typeof index === 'number') {
            files.splice(index, 1);
            emit('update:modelValue', files);
        }
        else {
            emit('update:modelValue', []);
        }
    }
    else {
        emit('update:modelValue', null);
    }
};

const getFileDisplayName = (file: MediaEntity) => {
    return file.filename || file.title || 'Unknown file';
};

const getFileSize = (file: MediaEntity) => {
    return mediaFormatter.formatFileSize(file.size);
};

const getFileTypeIcon = (mimeType: string) => {
    return mediaFormatter.getFileIcon(mimeType);
};
</script>

<template>
    <div class="space-y-2 flex flex-col h-full">
        <!-- Label -->
        <label
            v-if="label"
            :for="id"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
            {{ label }}
            <span
                v-if="required"
                class="text-red-500 ml-1"
            >*</span>
        </label>

        <!-- Media Uploader -->
        <MediaUploader
            :model-value="props.modelValue"
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
            @update:model-value="(value) => { emit('update:modelValue', value); }"
            @upload:success="handleUploadSuccess"
        />

        <!-- Media Manager Button -->
        <div
            v-if="showManager"
            class="flex items-center gap-2"
        >
            <Button
                type="button"
                variant="outline"
                size="sm"
                :disabled="disabled"
                @click="openManager"
            >
                <Icon
                    name="solar:folder-open-outline"
                    class="w-4 h-4 mr-2"
                />
                {{ t('media.open_gallery') }}
            </Button>
        </div>

        <!-- Selected Files Display (Only for Multiple Files) -->
        <div
            v-if="multiple && props.modelValue && Array.isArray(props.modelValue) && props.modelValue.length > 0"
            class="space-y-3"
        >
            <div class="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon
                    name="solar:check-circle-outline"
                    class="shrink-0 size-4 text-success"
                />
                <span>{{ t('media.selected_files') }}:</span>
            </div>

            <!-- Multiple Files Display -->
            <div class="space-y-3">
                <div
                    v-for="(file, index) in props.modelValue"
                    :key="file.id"
                    class="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-premium hover-lift"
                >
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <NuxtImg
                                v-if="file.mimeType?.startsWith('image/')"
                                :src="getDirectImageSrc(file)"
                                :alt="getFileDisplayName(file)"
                                class="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                            <div
                                v-else
                                class="w-12 h-12 bg-muted rounded-lg border border-border flex items-center justify-center"
                            >
                                <Icon
                                    :name="getFileTypeIcon(file.mimeType || '')"
                                    class="w-6 h-6 text-muted-foreground"
                                />
                            </div>
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                                <Icon
                                    name="solar:check-circle-bold"
                                    class="w-3 h-3 text-success-foreground"
                                />
                            </div>
                        </div>
                        <div>
                            <div class="font-medium text-sm text-foreground">
                                {{ getFileDisplayName(file) }}
                            </div>
                            <div class="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon
                                    name="solar:hard-drive-outline"
                                    class="shrink-0 size-3"
                                />
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
                        <Icon
                            name="solar:trash-bin-minimalistic-outline"
                            class="w-4 h-4"
                        />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Error Messages -->
        <div
            v-if="errors.length > 0"
            class="space-y-1"
        >
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
            :selected-files="Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []"
            @select="handleManagerSelectFromSelectEvent"
            @update:selected-files="handleManagerSelect"
        />
    </div>
</template>

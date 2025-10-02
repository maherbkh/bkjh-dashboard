<script setup lang="ts">
import type { MediaFile, MediaQueryParams } from '~/types/media';
import { useMediaManager } from '~/composables/useMediaManager';
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage';

interface Props {
    open?: boolean;
    multiple?: boolean;
    maxSelection?: number;
    allowedTypes?: string[];
    accessLevel?: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    collectionName?: string;
    modelType?: string;
    modelId?: string;
    selectedFiles?: MediaFile[];
}

const props = withDefaults(defineProps<Props>(), {
    open: false,
    multiple: false,
    maxSelection: 1,
    allowedTypes: () => ['image'],
    accessLevel: 'PUBLIC',
    collectionName: '',
    modelType: '',
    modelId: '',
    selectedFiles: () => [],
});

const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:selectedFiles': [files: MediaFile[]];
    'select': [file: MediaFile | MediaFile[]];
    'close': [];
}>();

const { t } = useI18n();
const { getImageSrc } = useAuthenticatedImage();

// Selection state management - removed unused variable

const {
    mediaFiles,
    loading,
    pagination,
    searchQuery,
    selectedFiles,
    selectFile,
    deselectFile,
    isSelected,
    isOriginal,
    loadMedia,
    searchMedia,
    resetSearch,
    nextPage,
    prevPage,
    goToPage,
} = useMediaManager({
    accessLevel: toRef(props, 'accessLevel'),
    collectionName: toRef(props, 'collectionName'),
    modelType: toRef(props, 'modelType'),
    modelId: toRef(props, 'modelId'),
    multiple: toRef(props, 'multiple'),
    maxSelection: toRef(props, 'maxSelection'),
    onSelect: (file) => emit('select', file),
});

// Watch for selectedFiles prop changes
watch(() => props.selectedFiles, (newFiles) => {
    selectedFiles.value = [...newFiles];
}, { immediate: true, deep: true });

// Watch for selectedFiles changes and emit
watch(selectedFiles, (newFiles) => {
    emit('update:selectedFiles', newFiles);
}, { deep: true });


const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
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

// Selection handlers
const handleSelect = () => {
    if (selectedFiles.value.length > 0) {
        if (props.multiple) {
            emit('select', selectedFiles.value);
        } else {
            const singleFile = selectedFiles.value[0];
            if (singleFile) {
                emit('select', singleFile);
            }
        }
        emit('update:selectedFiles', selectedFiles.value);
        handleClose();
    }
};

const handleClose = () => {
    emit('update:open', false);
    emit('close');
};

// Load media when dialog opens
watch(() => props.open, (isOpen) => {
    if (isOpen) {
        loadMedia();
    }
});
</script>

<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
                <DialogTitle>{{ t('media.gallery_title') }}</DialogTitle>
                <DialogDescription>
                    {{ t('media.gallery_description') }}
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-4">
                <!-- Search Bar -->
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <Icon name="solar:magnifer-outline" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            v-model="searchQuery"
                            :placeholder="t('media.search_placeholder')"
                            class="pl-10"
                            @keyup.enter="searchMedia"
                        />
                    </div>
                    <Button
                        variant="outline"
                        @click="searchMedia"
                    >
                        <Icon name="solar:magnifer-outline" class="w-4 h-4 mr-2" />
                        {{ t('common.search') }}
                    </Button>
                    <Button
                        variant="outline"
                        @click="resetSearch"
                    >
                        <Icon name="solar:restart-outline" class="w-4 h-4 mr-2" />
                        {{ t('common.reset') }}
                    </Button>
                </div>

                <!-- Media Grid -->
                <div class="max-h-96 overflow-y-auto">
                    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div
                            v-for="i in 12"
                            :key="i"
                            class="aspect-square bg-muted rounded-lg animate-pulse loading-shimmer"
                        />
                    </div>
                    <div v-else-if="mediaFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div
                            v-for="file in mediaFiles"
                            :key="file.id"
                            :class="[
                                'relative group cursor-pointer rounded-lg border-2 transition-all duration-300 hover-lift',
                                'bg-card/50 backdrop-blur-sm shadow-premium',
                                isSelected(file.id) ? 'border-primary ring-2 ring-primary/20 shadow-premium-lg' : 'border-border hover:border-primary/50',
                                isOriginal(file.id) ? 'opacity-50 cursor-not-allowed' : ''
                            ]"
                            @click="isOriginal(file.id) ? null : selectFile(file)"
                        >
                            <!-- File Preview -->
                            <div class="aspect-square overflow-hidden rounded-lg">
                                <NuxtImg
                                    v-if="file.mimeType?.startsWith('image/')"
                                    :src="getImageSrc(file)"
                                    :alt="file.filename"
                                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div
                                    v-else
                                    class="w-full h-full flex items-center justify-center bg-muted"
                                >
                                    <Icon :name="getFileIcon(file.mimeType || '')" class="w-8 h-8 text-muted-foreground" />
                                </div>
                            </div>

                            <!-- File Info -->
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-3 text-xs">
                                <div class="truncate font-medium">{{ file.filename }}</div>
                                <div class="flex items-center gap-1 text-muted-foreground">
                                    <Icon name="solar:hard-drive-outline" class="shrink-0 size-3" />
                                    <span>{{ formatFileSize(file.size || 0) }}</span>
                                </div>
                            </div>

                            <!-- Selection Indicator -->
                            <div
                                v-if="isSelected(file.id)"
                                class="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-premium"
                            >
                                <Icon name="solar:check-circle-bold" class="w-4 h-4 text-primary-foreground" />
                            </div>

                            <!-- Hover Overlay -->
                            <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                <div class="bg-background/90 backdrop-blur-sm rounded-full p-2">
                                    <Icon name="solar:eye-outline" class="w-5 h-5 text-primary" />
                                </div>
                            </div>

                            <!-- Original Indicator -->
                            <div
                                v-if="isOriginal(file.id)"
                                class="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs"
                            >
                                {{ t('media.current') }}
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-12">
                        <Icon name="solar:gallery-minimalistic-outline" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p class="text-gray-500 dark:text-gray-400">{{ t('media.no_files_found') }}</p>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="pagination && pagination.total > pagination.per_page" class="flex items-center justify-between">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ t('common.showing') }} {{ pagination.from }} {{ t('common.to') }} {{ pagination.to }} {{ t('common.of') }} {{ pagination.total }}
                    </div>
                    <div class="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="pagination.current_page === 1"
                            @click="prevPage"
                        >
                            <Icon name="solar:alt-arrow-left-outline" class="w-4 h-4" />
                        </Button>
                        <span class="text-sm">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="pagination.current_page === pagination.last_page"
                            @click="nextPage"
                        >
                            <Icon name="solar:alt-arrow-right-outline" class="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Icon name="solar:check-circle-outline" class="w-4 h-4" />
                        {{ selectedFiles.length }} {{ t('media.selected') }}
                    </div>
                    <div class="flex gap-2">
                        <Button variant="outline" @click="handleClose">
                            {{ t('common.cancel') }}
                        </Button>
                        <Button @click="handleSelect" :disabled="selectedFiles.length === 0">
                            {{ t('media.select_files') }} ({{ selectedFiles.length }})
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

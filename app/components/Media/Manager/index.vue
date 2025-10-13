<script setup lang="ts">
import type { MediaEntity, AccessLevel, CollectionType } from '~/types/media/index'
import { AccessLevel as AccessLevelEnum, CollectionType as CollectionTypeEnum } from '~/types/media/index'
import { useMediaRepository, useMediaSelection, useMediaFilters, useMediaPermissions, useMediaErrorHandler, useMediaLoading } from '~/composables/media'
import { toast } from 'vue-sonner'
import { useAuthenticatedImage } from '~/composables/useAuthenticatedImage'
import { mediaFormatter } from '~/services/media'
import MediaLoadingGrid from '~/components/Media/molecules/MediaLoadingGrid.vue'
import MediaErrorDisplay from '~/components/Media/molecules/MediaErrorDisplay.vue'

interface Props {
    open?: boolean
    multiple?: boolean
    maxSelection?: number
    allowedTypes?: string[]
    accessLevel?: AccessLevel
    collectionName?: CollectionType
    modelType?: string
    modelId?: string
    selectedFiles?: MediaEntity[]
}

const props = withDefaults(defineProps<Props>(), {
    open: false,
    multiple: false,
    maxSelection: 1,
    allowedTypes: () => ['image'],
    accessLevel: AccessLevelEnum.PUBLIC,
    collectionName: CollectionTypeEnum.DEFAULT,
    modelType: '',
    modelId: '',
    selectedFiles: () => [],
})

const emit = defineEmits<{
    'update:open': [value: boolean]
    'update:selectedFiles': [files: MediaEntity[]]
    'select': [file: MediaEntity | MediaEntity[] | string | string[]] // Emit IDs when maxSelection is 1
    'close': []
}>()

const { t } = useI18n()
const { getImageSrc } = useAuthenticatedImage()

// Use new composables
const repository = useMediaRepository()
const selection = useMediaSelection(props.multiple, props.maxSelection)
const filters = useMediaFilters()
const permissions = useMediaPermissions()
const errorHandler = useMediaErrorHandler()
const loading = useMediaLoading()

// Media state
const mediaFiles = ref<MediaEntity[]>([])
const pagination = ref<any>(null)

// Initialize filters with props
watch(() => props.accessLevel, (level: AccessLevel | undefined) => {
    if (level) filters.setAccessLevel(level)
}, { immediate: true })

watch(() => props.collectionName, (collection: CollectionType | undefined) => {
    if (collection) filters.setCollection(collection)
}, { immediate: true })

watch(() => props.modelType, (type: string | undefined) => {
    if (type && props.modelId) {
        filters.setModel(type, props.modelId)
    }
}, { immediate: true })

// Watch for selectedFiles prop changes
watch(() => props.selectedFiles, (newFiles: MediaEntity[]) => {
    selection.setSelection(newFiles)
}, { immediate: true, deep: true })

// Watch for selection changes and emit
watch(selection.selected, (newFiles: MediaEntity[]) => {
    emit('update:selectedFiles', newFiles)
}, { deep: true })

// Load media using repository
const loadMedia = async () => {
    loading.startFetch('media')
    errorHandler.clearErrors()

    try {
        const response = await repository.findAll(filters.queryDto.value)
        mediaFiles.value = response.data
        pagination.value = response.meta
        
        if (response.data.length === 0) {
            toast.info(t('media.no_files_found'), {
                description: t('media.try_different_search')
            })
        }
    } catch (error) {
        console.error('Failed to load media:', error)
        errorHandler.addError(error as any)
        mediaFiles.value = []
        pagination.value = null
    } finally {
        loading.finishFetch('media')
    }
}

// Search and pagination functions using filters composable
const searchMedia = async () => {
    filters.setSearch(filters.searchQuery.value)
    await loadMedia()
}

const resetSearch = async () => {
    filters.resetFilters()
    await loadMedia()
}

const nextPage = async () => {
    filters.nextPage()
    await loadMedia()
}

const prevPage = async () => {
    filters.prevPage()
    await loadMedia()
}

const goToPage = async (page: number) => {
    filters.goToPage(page)
    await loadMedia()
}

// File selection functions using selection composable
const selectFile = (file: MediaEntity) => {
    selection.select(file)
}

const deselectFile = (file: MediaEntity) => {
    selection.deselect(file)
}

const isSelected = (fileId: string): boolean => {
    return selection.isSelected({ id: fileId } as MediaEntity)
}

const isOriginal = (fileId: string): boolean => {
    // This would need to be implemented based on your business logic
    // For now, return false
    return false
}


const formatFileSize = (bytes: number) => {
    return mediaFormatter.formatFileSize(bytes)
}

const getFileIcon = (mimeType: string) => {
    return mediaFormatter.getFileIcon(mimeType)
}

// Selection handlers using selection composable
const handleSelect = () => {
    if (selection.hasSelection.value) {
        if (props.multiple) {
            // Emit full media objects for multiple selection
            emit('select', selection.selected.value)
            toast.success(t('media.files_selected'), {
                description: t('media.selected_count', { count: selection.selectionCount.value })
            })
        } else {
            // Emit media ID for single selection
            const singleFile = selection.firstSelected.value
            if (singleFile) {
                emit('select', singleFile.id)
                toast.success(t('media.file_selected'), {
                    description: singleFile.filename
                })
            }
        }
        emit('update:selectedFiles', selection.selected.value)
        handleClose()
    }
}

const handleClose = () => {
    emit('update:open', false)
    emit('close')
}

// Load media when dialog opens
watch(() => props.open, (isOpen: boolean) => {
    if (isOpen) {
        loadMedia()
    }
})
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
                            v-model="filters.searchQuery.value"
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

                <!-- Error Display -->
                <MediaErrorDisplay
                    v-if="errorHandler.isError.value"
                    :errors="errorHandler.errors.value"
                    @clear-all="errorHandler.clearErrors"
                    @clear-validation="errorHandler.clearValidationErrors"
                    @clear-upload="errorHandler.clearUploadErrors"
                    @clear-permission="errorHandler.clearPermissionErrors"
                />

                <!-- Media Grid -->
                       <div class="max-h-96 overflow-y-auto">
                           <MediaLoadingGrid v-if="loading.getLoadingState('media').isLoading" />
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
                        {{ selection.selectionCount.value }} {{ t('media.selected') }}
                    </div>
                    <div class="flex gap-2">
                        <Button variant="outline" @click="handleClose">
                            {{ t('common.cancel') }}
                        </Button>
                        <Button @click="handleSelect" :disabled="!selection.hasSelection.value">
                            {{ t('media.select_files') }} ({{ selection.selectionCount.value }})
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>


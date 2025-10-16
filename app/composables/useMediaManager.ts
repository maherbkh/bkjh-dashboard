import type { MediaFile, MediaQueryParams, MediaPagination } from '~/types/media';

interface UseMediaManagerOptions {
    accessLevel: Ref<'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC'>;
    collectionName: Ref<string>;
    modelType: Ref<string>;
    modelId: Ref<string>;
    multiple: Ref<boolean>;
    maxSelection: Ref<number>;
    onSelect?: (file: MediaFile) => void;
}

export function useMediaManager(options: UseMediaManagerOptions) {
    const { t } = useI18n();

    // Reactive state
    const mediaFiles = ref<MediaFile[]>([]);
    const loading = ref(false);
    const pagination = ref<MediaPagination | null>(null);
    const searchQuery = ref('');
    const selectedFiles = ref<MediaFile[]>([]);

    // Query parameters
    const queryParams = ref<MediaQueryParams>({
        page: 1,
        length: 24,
        search: '',
        accessLevel: options.accessLevel.value.toUpperCase() as 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC',
        collectionName: options.collectionName.value,
        modelType: options.modelType.value,
        modelId: options.modelId.value,
        sort_by: 'createdAt',
        sort_dir: 'desc',
    });

    // Load media files
    const loadMedia = async (params?: Partial<MediaQueryParams>) => {
        loading.value = true;

        try {
            const finalParams = { ...queryParams.value, ...params };

            // Only include parameters that have meaningful values
            const cleanParams: Record<string, any> = {};

            // Always include pagination
            if (finalParams.page && finalParams.page > 1) {
                cleanParams.page = finalParams.page;
            }
            if (finalParams.length && finalParams.length !== 24) {
                cleanParams.length = finalParams.length;
            }

            // Only include search if it has a value
            if (finalParams.search && finalParams.search.trim() !== '') {
                cleanParams.search = finalParams.search.trim();
            }

            // Only include accessLevel if it's not the default
            if (finalParams.accessLevel && finalParams.accessLevel !== 'PUBLIC') {
                cleanParams.accessLevel = finalParams.accessLevel;
            }

            // Only include collectionName if it has a value
            if (finalParams.collectionName && finalParams.collectionName.trim() !== '') {
                cleanParams.collectionName = finalParams.collectionName;
            }

            // Only include modelType if it has a value
            if (finalParams.modelType && finalParams.modelType.trim() !== '') {
                cleanParams.modelType = finalParams.modelType;
            }

            // Only include modelId if it has a value
            if (finalParams.modelId && finalParams.modelId.trim() !== '') {
                cleanParams.modelId = finalParams.modelId;
            }

            // Only include mimeType if it has a value
            if (finalParams.mimeType && finalParams.mimeType.trim() !== '') {
                cleanParams.mimeType = finalParams.mimeType;
            }

            // Only include sort parameters if they're not defaults
            if (finalParams.sort_by && finalParams.sort_by !== 'createdAt') {
                cleanParams.sort_by = finalParams.sort_by;
            }
            if (finalParams.sort_dir && finalParams.sort_dir !== 'desc') {
                cleanParams.sort_dir = finalParams.sort_dir;
            }

            const { data, error } = await useApiFetch('/shared/media', {
                params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
            });

            if (error.value) {
                throw new Error(error.value.message || t('media.load_error'));
            }

            if (data.value?.data) {
                // Handle nested data structure: data.data.data contains the files
                const responseData = data.value.data;
                if (responseData.data) {
                    // Files are in data.data.data
                    mediaFiles.value = responseData.data;
                }
                else {
                    // Fallback: files are directly in data.data
                    mediaFiles.value = responseData;
                }

                // Handle pagination from the response
                const response = data.value as any;
                if (response.data?.meta) {
                    // New structure with meta object
                    const meta = response.data.meta;
                    pagination.value = {
                        current_page: meta.page,
                        last_page: meta.totalPages,
                        per_page: meta.limit,
                        total: meta.total,
                        from: (meta.page - 1) * meta.limit + 1,
                        to: Math.min(meta.page * meta.limit, meta.total),
                    };
                }
                else if (response.pagination) {
                    pagination.value = response.pagination;
                }
                else if (response.current_page) {
                    // Fallback for different response structure
                    pagination.value = {
                        current_page: response.current_page,
                        last_page: response.last_page,
                        per_page: response.per_page,
                        total: response.total,
                        from: response.from,
                        to: response.to,
                    };
                }
            }
        }
        catch (err) {
            console.error('Failed to load media:', err);
            mediaFiles.value = [];
            pagination.value = null;
        }
        finally {
            loading.value = false;
        }
    };

    // Search media
    const searchMedia = async () => {
        await loadMedia({
            search: searchQuery.value,
            page: 1,
        });
    };

    // Reset search
    const resetSearch = async () => {
        searchQuery.value = '';
        await loadMedia({
            search: '',
            page: 1,
        });
    };

    // Pagination
    const nextPage = async () => {
        if (pagination.value && pagination.value.current_page < pagination.value.last_page) {
            await loadMedia({
                page: pagination.value.current_page + 1,
            });
        }
    };

    const prevPage = async () => {
        if (pagination.value && pagination.value.current_page > 1) {
            await loadMedia({
                page: pagination.value.current_page - 1,
            });
        }
    };

    const goToPage = async (page: number) => {
        if (pagination.value && page >= 1 && page <= pagination.value.last_page) {
            await loadMedia({
                page,
            });
        }
    };

    // File selection
    const selectFile = (file: MediaFile) => {
        if (!options.multiple.value) {
            selectedFiles.value = [file];
        }
        else {
            const index = selectedFiles.value.findIndex(f => f.id === file.id);
            if (index === -1) {
                if (selectedFiles.value.length < options.maxSelection.value) {
                    selectedFiles.value.push(file);
                }
            }
            else {
                selectedFiles.value.splice(index, 1);
            }
        }
        options.onSelect?.(file);
    };

    const deselectFile = (file: MediaFile) => {
        const index = selectedFiles.value.findIndex(f => f.id === file.id);
        if (index !== -1) {
            selectedFiles.value.splice(index, 1);
        }
    };

    const clearSelection = () => {
        selectedFiles.value = [];
    };

    // Check if file is selected
    const isSelected = (fileId: string): boolean => {
        return selectedFiles.value.some(file => file.id === fileId);
    };

    // Check if file is original (already attached to model)
    const isOriginal = (fileId: string): boolean => {
        // This would need to be implemented based on your business logic
        // For now, return false
        return false;
    };

    // Watch for parameter changes
    watch([
        () => options.accessLevel.value,
        () => options.collectionName.value,
        () => options.modelType.value,
        () => options.modelId.value,
    ], () => {
        queryParams.value = {
            ...queryParams.value,
            accessLevel: options.accessLevel.value.toUpperCase() as 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC',
            collectionName: options.collectionName.value,
            modelType: options.modelType.value,
            modelId: options.modelId.value,
        };
    });

    return {
        mediaFiles: readonly(mediaFiles),
        loading: readonly(loading),
        pagination: readonly(pagination),
        searchQuery,
        selectedFiles,
        queryParams: readonly(queryParams),
        loadMedia,
        searchMedia,
        resetSearch,
        nextPage,
        prevPage,
        goToPage,
        selectFile,
        deselectFile,
        clearSelection,
        isSelected,
        isOriginal,
    };
}

<script setup lang="ts">
import type { Setting, SettingForm, TableHeaderItem, ServerParamsTypes } from '~/types';
import { createSettingSchema } from '~/composables/settingSchema';
import { SettingValueType, AppDomain } from '~/types/settings';
import { useUserStore } from '~/stores/user';

const { t } = useI18n();

/**
 * Check superAdmin permission
 */
const userStore = useUserStore();
await userStore.fetchAuthUser();

if (!userStore.user?.isSuperAdmin) {
    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'You do not have permission to access this page',
    });
}

// Page configuration
const pageTitle = computed(() => t('setting.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('setting.plural'));
definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// CRUD operations
const {
    items: settings,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Setting, SettingForm>({
    crudPath: 'settings',
    tenant: 'shared',
    formSchema: createSettingSchema(t),
});

const selectedRows = ref<string[]>([]);

/**
 * Search and pagination state
 */
const searchQuery = ref<string>('');
const currentPage = ref<number>(1);
const perPage = ref<number>(25);
const sortBy = ref<string>('key');
const sortDir = ref<'asc' | 'desc'>('asc');

// Computed properties
const status = computed(() => isLoading.value ? 'pending' : 'success');

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('setting.name') || t('global.name'),
        id: 'name',
    },
    {
        as: 'th',
        name: t('setting.type'),
        id: 'type',
        sortable: false,
    },
    {
        as: 'th',
        name: t('setting.parent') || 'Parent',
        id: 'parentId',
        sortable: false,
    },
    {
        as: 'th',
        name: t('setting.apps') || t('admin.apps'),
        id: 'apps',
        sortable: false,
    },
    {
        as: 'th',
        name: t('setting.public') || t('common.public'),
        id: 'isPublic',
        sortable: false,
    },
]);

// Initialize data
await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
});

/**
 * Dialog state management
 */
const isDialogOpen = ref<boolean>(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingSetting = ref<Setting | null>(null);
const isSubmitting = ref<boolean>(false);

/**
 * Open add dialog
 */
const openAddDialog = (): void => {
    dialogMode.value = 'add';
    resetForm();
    editingSetting.value = null;
    isDialogOpen.value = true;
};

/**
 * Handle edit setting
 */
const handleEdit = (setting: Setting): void => {
    if (!setting || !setting.id) {
        console.warn('Invalid setting provided for edit:', setting);
        return;
    }

    dialogMode.value = 'edit';
    editingSetting.value = setting;

    setValues({
        key: setting.key,
        name: setting.name,
        description: setting.description ?? null,
        type: setting.type,
        value: setting.value,
        apps: setting.apps ?? [],
        isPublic: setting.isPublic ?? false,
        parentId: setting.parentId ?? null,
    });
    isDialogOpen.value = true;
};

/**
 * Submit form and close dialog
 */
const onSubmitAndClose = async (values: SettingForm): Promise<void> => {
    isSubmitting.value = true;
    try {
        if (editingSetting.value?.id) {
            // Edit existing setting
            await updateItem(editingSetting.value.id, values);
        }
        else {
            // Add new setting
            await createItem(values);
        }
        selectedRows.value = [];

        // Refresh with current params to preserve pagination, search, and sort
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        }, Date.now());

        // Close dialog on success
        isDialogOpen.value = false;
        editingSetting.value = null;
        resetForm();
    }
    catch (error: unknown) {
        console.error('Error submitting form:', error);
        // Keep dialog open to show errors - error handling is done in the CRUD composable
    }
    finally {
        isSubmitting.value = false;
    }
};

/**
 * Submit form and add new item
 */
const onSubmitAndAddNew = async (values: SettingForm): Promise<void> => {
    isSubmitting.value = true;
    try {
        if (editingSetting.value?.id) {
            // Edit existing setting
            await updateItem(editingSetting.value.id, values);
            // After update, switch to add mode
            editingSetting.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new setting
            await createItem(values);
            // Force form reset by temporarily changing dialogMode to trigger watcher
            dialogMode.value = 'edit';
            await nextTick();
            dialogMode.value = 'add';
        }
        selectedRows.value = [];

        // Refresh with current params to preserve pagination, search, and sort
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        }, Date.now());

        // Reset form but keep dialog open for adding new item
        resetForm();
    }
    catch (error: unknown) {
        console.error('Error submitting form:', error);
        // Keep dialog open to show errors - error handling is done in the CRUD composable
    }
    finally {
        isSubmitting.value = false;
    }
};

/**
 * Handle dialog close
 */
const handleDialogClose = (): void => {
    isDialogOpen.value = false;
    resetForm();
    editingSetting.value = null;
};

/**
 * Delete handlers
 */
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

/**
 * Handle single setting deletion
 */
const handleDelete = async (settingId: string): Promise<void> => {
    if (!settingId || typeof settingId !== 'string') {
        console.warn('Invalid setting ID for deletion:', settingId);
        return;
    }

    const confirmed = await confirmDelete();
    if (!confirmed) {
        return;
    }

    try {
        await deleteItem(settingId);
        // No need to manually refresh - useCrud handles it automatically
    }
    catch (error: unknown) {
        console.error('Error deleting setting:', error);
    }
};

/**
 * Handle bulk deletion
 */
const handleBulkDelete = async (): Promise<void> => {
    if (selectedRows.value.length === 0) {
        return;
    }

    const confirmed = await confirmBulkDelete(selectedRows.value.length);
    if (!confirmed) {
        return;
    }

    try {
        await deleteManyItems(selectedRows.value);
        selectedRows.value = [];
        // No need to manually refresh - useCrud handles it automatically
    }
    catch (error: unknown) {
        console.error('Error deleting settings:', error);
    }
};

/**
 * Search and pagination handlers
 */
const handleReset = async (): Promise<void> => {
    searchQuery.value = '';
    currentPage.value = 1;
    sortBy.value = 'key';
    sortDir.value = 'asc';
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

/**
 * Handle search submit
 */
const handleSearchSubmit = async (): Promise<void> => {
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

/**
 * Handle page change
 */
const handlePageChange = async (page: number): Promise<void> => {
    if (typeof page !== 'number' || page < 1) {
        console.warn('Invalid page number:', page);
        return;
    }

    currentPage.value = page;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

/**
 * Handle sort change
 */
const handleSortChange = async (dir: 'asc' | 'desc', id: string): Promise<void> => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid sort ID:', id);
        return;
    }

    if (dir !== 'asc' && dir !== 'desc') {
        console.warn('Invalid sort direction:', dir);
        return;
    }

    sortDir.value = dir;
    sortBy.value = id;
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

/**
 * Row selection handlers
 */
const isAllSelected = computed<boolean>(() => {
    return settings.value.length > 0 && selectedRows.value.length === settings.value.length;
});

/**
 * Handle select all rows
 */
const handleSelectAll = (checked: boolean): void => {
    if (checked) {
        selectedRows.value = settings.value.map((setting: Setting) => setting.id);
    }
    else {
        selectedRows.value = [];
    }
};

/**
 * Handle row selection
 */
const handleRowSelected = (id: string, checked: boolean): void => {
    if (!id || typeof id !== 'string') {
        console.warn('Invalid row ID for selection:', id);
        return;
    }

    if (checked) {
        if (!selectedRows.value.includes(id)) {
            selectedRows.value.push(id);
        }
    }
    else {
        selectedRows.value = selectedRows.value.filter((rowId: string) => rowId !== id);
    }
};

/**
 * Type guard for uploader value
 */
interface UploaderValueDisplay {
    mediaId?: string | null;
    alt?: string;
    title?: string;
}

const isUploaderValueDisplay = (value: unknown): value is UploaderValueDisplay => {
    return (
        typeof value === 'object'
        && value !== null
        && ('mediaId' in value || 'alt' in value || 'title' in value)
    );
};

/**
 * Helper function for displaying setting values
 */
const formatValue = (value: unknown, type: SettingValueType | string): string => {
    if (value === null || value === undefined) {
        return '-';
    }

    // Handle string type - might be JSON-encoded
    if (type === SettingValueType.STRING || type === 'STRING') {
        const strValue = String(value);
        // Check if it's a JSON-encoded string (starts and ends with quotes)
        if (strValue.startsWith('"') && strValue.endsWith('"')) {
            try {
                const parsed = JSON.parse(strValue);
                return typeof parsed === 'string' ? parsed : strValue;
            }
            catch {
                return strValue;
            }
        }
        return strValue;
    }

    // Handle array type
    if (type === SettingValueType.ARRAY || type === 'ARRAY') {
        if (Array.isArray(value)) {
            return `[${value.join(', ')}]`;
        }
        return String(value);
    }

    // Handle uploader type
    if (type === SettingValueType.UPLOADER || type === 'UPLOADER') {
        if (isUploaderValueDisplay(value)) {
            if (value.mediaId) {
                return value.title ?? value.alt ?? 'Media';
            }
            return 'No media';
        }
        return String(value);
    }

    switch (type) {
        case SettingValueType.BOOLEAN:
            return value ? 'true' : 'false';
        case SettingValueType.JSON:
            try {
                return JSON.stringify(value, null, 2);
            }
            catch {
                return String(value);
            }
        case SettingValueType.DATE:
            try {
                const dateValue = typeof value === 'string' ? value : String(value);
                return new Date(dateValue).toLocaleDateString();
            }
            catch {
                return String(value);
            }
        case SettingValueType.NUMBER:
            return String(value);
        default:
            return String(value);
    }
};

/**
 * Get type label for display
 */
const getTypeLabel = (type: SettingValueType): string => {
    return type;
};

/**
 * Section type for parent lookup
 */
interface SectionLookup {
    readonly id: string;
    readonly name: string;
}

/**
 * Sections API response
 */
interface SectionsApiResponse {
    readonly data: Array<{
        readonly id: string;
        readonly name: string;
        readonly type: string;
    }>;
}

/**
 * Fetch sections for parent name lookup
 */
const sections = ref<SectionLookup[]>([]);
const sectionsFetched = ref(false);

const fetchSections = async (): Promise<void> => {
    if (sectionsFetched.value) return; // Prevent duplicate calls
    sectionsFetched.value = true;

    try {
        const { data } = await useApiFetch<SectionsApiResponse>('/shared/settings/sections', {
            method: 'GET',
        });

        if (data.value?.data && Array.isArray(data.value.data)) {
            sections.value = data.value.data.map((section: { id: string; name: string }) => ({
                id: section.id,
                name: section.name,
            }));
        }
    }
    catch (error: unknown) {
        sectionsFetched.value = false; // Reset on error so it can retry
        console.error('Error fetching sections:', error);
    }
};

/**
 * Get parent name by ID
 */
const getParentName = (parentId: string | null): string | null => {
    if (!parentId || typeof parentId !== 'string') {
        return null;
    }

    const parent = sections.value.find((section: SectionLookup) => section.id === parentId);
    return parent?.name ?? null;
};

// Fetch sections on mount
onMounted(() => {
    fetchSections();
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:settings-outline'"
            @add-new="openAddDialog"
        >
            <template #actions>
                <LazyButton
                    v-if="selectedRows.length > 0"
                    class="cursor-pointer"
                    variant="destructive"
                    size="sm"
                    @click="handleBulkDelete"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                    />
                    {{ $t('action.delete_all') }}
                </LazyButton>
            </template>
        </PageHeaderActions>
        <div>
            <PageSearchForm
                v-model:search-query="searchQuery"
                @search-submit="handleSearchSubmit"
                @reset-search="handleReset"
            />
        </div>
        <div>
            <div>
                <PageEmptyState
                    v-if="settings.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('setting.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="settings.map((setting: Setting) => ({
                            ...setting,
                            selected: selectedRows.includes(setting.id),
                        }))"
                        :selected-rows="selectedRows"
                        :loading="isLoading"
                        :skeleton-rows="perPage"
                        :selectable="true"
                        :params="{
                            page: currentPage,
                            length: perPage,
                            sortBy: sortBy,
                            sortDir: sortDir,
                            search: searchQuery,
                        } as ServerParamsTypes"
                        :model-value="isAllSelected"
                        @toggle-sort="handleSortChange"
                        @row-selected="(id, checked) => handleRowSelected(String(id), checked)"
                        @update:selected-rows="(rows) => selectedRows = rows.map(String)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-name="{ row }">
                            <div>
                                <div>
                                    {{ row.name || '-' }}
                                </div>
                                <div class="text-muted-foreground text-xs italic mt-0.5">
                                    {{ row.key }}
                                </div>
                            </div>
                        </template>

                        <template #cell-type="{ row }">
                            <Badge
                                variant="outline"
                                class="text-xs"
                            >
                                {{ getTypeLabel(row.type) }}
                            </Badge>
                        </template>

                        <template #cell-parentId="{ row }">
                            <Badge
                                v-if="row.parentId && row.parent && row.parent.name"
                                variant="outline"
                                class="text-xs"
                            >
                                {{ row.parent.name }}
                            </Badge>
                            <span
                                v-else
                                class="text-muted-foreground text-xs italic mt-0.5"
                            >
                                -
                            </span>
                        </template>

                        <template #cell-apps="{ row }">
                            <div class="flex gap-1 flex-wrap items-center">
                                <template v-if="!row.apps || row.apps.length === 0">
                                    <span class="text-muted-foreground text-sm">
                                        -
                                    </span>
                                </template>
                                <template v-else-if="row.apps.length === 1">
                                    <Badge
                                        variant="outline"
                                        class="text-xs"
                                    >
                                        {{ row.apps[0] }}
                                    </Badge>
                                </template>
                                <TooltipProvider v-else>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <div class="flex gap-1 items-center">
                                                <Badge
                                                    variant="outline"
                                                    class="text-xs"
                                                >
                                                    {{ row.apps[0] }}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    class="text-xs cursor-help"
                                                >
                                                    +{{ row.apps.length - 1 }}
                                                </Badge>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div class="flex flex-col gap-1">
                                                <div
                                                    v-for="app in row.apps"
                                                    :key="app"
                                                    class="text-xs"
                                                >
                                                    {{ app }}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </template>

                        <template #cell-isPublic="{ row }">
                            <Badge
                                :variant="row.isPublic ? 'default' : 'secondary'"
                                class="text-xs"
                            >
                                {{ row.isPublic ? $t('common.public') : $t('common.private') }}
                            </Badge>
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <LazyButton
                                    :title="$t('action.edit')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="handleEdit(row)"
                                >
                                    <Icon
                                        name="solar:pen-new-square-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                                <LazyButton
                                    :title="$t('action.delete')"
                                    variant="ghost"
                                    size="icon"
                                    @click="handleDelete(row.id)"
                                >
                                    <Icon
                                        name="solar:trash-bin-trash-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-destructive"
                                    />
                                </LazyButton>
                            </div>
                        </template>
                    </PageTable>
                    <PageTablePaginator
                        class="mt-5"
                        :meta="{
                            currentPage: pagination.currentPage,
                            lastPage: pagination.lastPage,
                            perPage: pagination.perPage,
                            total: pagination.total,
                            from: (pagination.currentPage - 1) * pagination.perPage + 1,
                            to: Math.min(pagination.currentPage * pagination.perPage, pagination.total),
                        }"
                        @update:page="handlePageChange"
                    />
                </template>
            </div>
        </div>

        <LazySettingFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-setting="editingSetting"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

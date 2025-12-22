<script setup lang="ts">
import type { EventTarget, EventTargetForm, TableHeaderItem, ServerParamsTypes } from '~/types';

const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('event_target.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('event_target.description'));
definePageMeta({
    middleware: 'auth',
});

const { formatDate } = useGermanDateFormat();

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// CRUD operations
const {
    items: eventTargets,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<EventTarget, EventTargetForm>({
    crudPath: 'event-targets',
    tenant: 'academy',
    formSchema: createEventTargetSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');

// Computed properties
const status = computed(() => (isLoading.value ? 'pending' : 'success'));

const headerItems = computed(() => [

    {
        as: 'th',
        name: t('global.name'),
        id: 'name',
    },
    {
        as: 'th',
        name: t('event_target.scope'),
        id: 'scope',
    },
    {
        as: 'th',
        name: t('common.position'),
        id: 'position',
    },

]);

// Initialize data
onMounted(async () => {
    await fetchItems(currentPage.value, perPage.value, {
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
});

// Search and pagination handlers
const handleReset = async () => {
    searchQuery.value = '';
    currentPage.value = 1;
    sortBy.value = 'name';
    sortDir.value = 'asc';
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

const handleSearchSubmit = async () => {
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
};

async function handleSortChange(dir: 'asc' | 'desc', id: string) {
    sortDir.value = dir;
    sortBy.value = id;
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    }, Date.now());
    selectedRows.value = [];
}

// Dialog state management
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingEventTarget = ref<EventTarget | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
    dialogMode.value = 'add';
    resetForm();
    editingEventTarget.value = null;
    isDialogOpen.value = true;
};

const handleEdit = async (eventTarget: EventTarget) => {
    dialogMode.value = 'edit';
    editingEventTarget.value = eventTarget;
    setValues({
        code: eventTarget.code,
        name: eventTarget.name,
        slug: eventTarget.slug,
        position: eventTarget.position,
    });
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: EventTargetForm) => {
    isSubmitting.value = true;
    try {
        if (editingEventTarget.value) {
            // Edit existing event target
            await updateItem(editingEventTarget.value.id, values);
        }
        else {
            // Add new event target
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
        editingEventTarget.value = null;
        resetForm();
    }
    catch (error) {
        console.error('Error submitting form:', error);
    // Keep dialog open to show errors - error handling is done in the CRUD composable
    // The dialog will remain open so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false;
    }
};

const onSubmitAndAddNew = async (values: EventTargetForm) => {
    isSubmitting.value = true;
    try {
        if (editingEventTarget.value) {
            // Edit existing event target
            await updateItem(editingEventTarget.value.id, values);
            // After update, switch to add mode
            editingEventTarget.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new event target
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
    catch (error) {
        console.error('Error submitting form:', error);
    // Keep dialog open to show errors - error handling is done in the CRUD composable
    // The dialog will remain open so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingEventTarget.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(eventTargetId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(eventTargetId);
    // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error deleting event target:', error);
    }
}

async function handleBulkDelete() {
    if (selectedRows.value.length === 0) return;

    const confirmed = await confirmBulkDelete(selectedRows.value.length);
    if (!confirmed) return;

    try {
        await deleteManyItems(selectedRows.value);
        selectedRows.value = [];
    // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error deleting event targets:', error);
    }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return (
        eventTargets.value.length > 0 && selectedRows.value.length === eventTargets.value.length
    );
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = eventTargets.value.map(eventTarget => String(eventTarget.id));
    }
    else {
        selectedRows.value = [];
    }
};

const handleRowSelected = (id: string, checked: boolean) => {
    if (checked) {
        selectedRows.value.push(id);
    }
    else {
        selectedRows.value = selectedRows.value.filter(rowId => rowId !== id);
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:target-outline'"
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
                    <Icon name="solar:trash-bin-minimalistic-outline" />
                    {{ $t("action.delete_all") }}
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
                    v-if="eventTargets.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="
                        $t('action.add') + $t('common.new') + ' ' + $t('event_target.singular')
                    "
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="eventTargets.map((eventTarget: EventTarget) => ({
                            ...eventTarget,
                            selected: selectedRows.includes(String(eventTarget.id)),
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
                        }"
                        :model-value="isAllSelected"
                        @toggle-sort="handleSortChange"
                        @row-selected="(id: number | string, checked: boolean) => handleRowSelected(String(id), checked)"
                        @update:selected-rows="
                            (rows: (string | number)[]) => (selectedRows = rows.map(String))
                        "
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-name="{ row }">
                            <div class="font-medium">
                                {{ row.name }}
                            </div>
                        </template>

                        <template #cell-scope="{ row }">
                            <Badge :variant="row.scope === 'ALL' ? 'secondary' : (row.scope === 'EXT' ? 'default' : 'success')">
                                {{ row.scope }}
                            </Badge>
                        </template>

                        <template #cell-position="{ row }">
                            <Badge variant="secondary">
                                {{ row.position }}
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

        <LazyEventTargetFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-event-target="editingEventTarget"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

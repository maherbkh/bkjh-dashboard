<script setup lang="ts">
import type { Speaker, SpeakerForm, TableHeaderItem, ServerParamsTypes } from '~/types';
import { createSpeakerSchema } from '~/composables/speakerSchema';

const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('speaker.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('speaker.plural'));
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
    items: speakers,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Speaker, SpeakerForm>({
    crudPath: 'speakers',
    tenant: 'academy',
    formSchema: createSpeakerSchema(t),
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

const headerItems = computed((): TableHeaderItem[] => [
    {
        as: 'th',
        name: t('global.name'),
        id: 'name',
        sortable: true,
    },
    {
        as: 'th',
        name: t('speaker.qualification'),
        id: 'qualification',
        sortable: false,
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'isActive',
        sortable: true,
    },
    {
        as: 'th',
        name: t('academy.plural'),
        id: 'eventsCount',
        sortable: true,
    },
    {
        as: 'th',
        name: t('common.created_at'),
        id: 'createdAt',
        sortable: true,
    },
]);

// Initialize data
onMounted(async () => {
    await fetchItems(currentPage.value, perPage.value, {
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
});

// Search and pagination handlers
const handleReset = async () => {
    searchQuery.value = '';
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
};

const handleSearchSubmit = async () => {
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
};

const handleSortChange = async (field: string, direction: 'asc' | 'desc') => {
    sortBy.value = field;
    sortDir.value = direction;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
};

const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
};

// Form dialog state
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingSpeaker = ref<Speaker | null>(null);
const isSubmitting = ref(false);

// Form handlers
const openAddDialog = () => {
    dialogMode.value = 'add';
    editingSpeaker.value = null;
    isDialogOpen.value = true;
};

const openEditDialog = (speaker: Speaker) => {
    dialogMode.value = 'edit';
    editingSpeaker.value = speaker;
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: SpeakerForm) => {
    isSubmitting.value = true;
    try {
        if (dialogMode.value === 'add') {
            await createItem(values);
        }
        else if (editingSpeaker.value) {
            await updateItem(editingSpeaker.value.id, values);
        }
        isDialogOpen.value = false;
    // No need to manually refresh - useCrud handles it automatically
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

const onSubmitAndAddNew = async (values: SpeakerForm) => {
    isSubmitting.value = true;
    try {
        if (editingSpeaker.value) {
            // Edit existing speaker
            await updateItem(editingSpeaker.value.id, values);
            // After update, switch to add mode
            editingSpeaker.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new speaker
            await createItem(values);
            // Force form reset by temporarily changing dialogMode to trigger watcher
            dialogMode.value = 'edit';
            await nextTick();
            dialogMode.value = 'add';
        }
        selectedRows.value = [];

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
    editingSpeaker.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(speakerId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(speakerId);
    // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error deleting speaker:', error);
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
        console.error('Error deleting speakers:', error);
    }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return (
        speakers.value.length > 0 && selectedRows.value.length === speakers.value.length
    );
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = speakers.value.map(speaker => String(speaker.id));
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

// Toggle active status
const handleToggleActive = async (speaker: Speaker) => {
    try {
        await updateItem(speaker.id, {
            ...speaker,
            isActive: !speaker.isActive,
        });
    // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error toggling speaker status:', error);
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:user-speak-outline'"
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
                    v-if="speakers.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('speaker.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems"
                        :rows="speakers.map((speaker: Speaker) => ({
                            ...speaker,
                            selected: selectedRows.includes(speaker.id),
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
                        @update:selected-rows="(rows: (string | number)[]) => selectedRows = rows.map(String)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-name="{ row }">
                            <div class="font-medium">
                                {{ row.name }}
                            </div>
                            <div
                                v-if="row.qualification"
                                class="text-sm text-muted-foreground"
                            >
                                {{ row.qualification }}
                            </div>
                        </template>

                        <template #cell-qualification="{ row }">
                            <div
                                v-if="row.qualification"
                                class="text-sm"
                            >
                                {{ row.qualification }}
                            </div>
                            <div
                                v-else
                                class="text-muted-foreground text-sm"
                            >
                                {{ $t("common.not_specified") }}
                            </div>
                        </template>

                        <template #cell-isActive="{ row }">
                            <Badge :variant="row.isActive ? 'default' : 'secondary'">
                                {{ row.isActive ? $t("common.active") : $t("common.inactive") }}
                            </Badge>
                        </template>

                        <template #cell-eventsCount="{ row }">
                            <span class="text-sm text-muted-foreground">
                                {{ row.eventsCount || 0 }} {{ $t("academy.plural") }}
                            </span>
                        </template>

                        <template #cell-created_at="{ row }">
                            {{ useGermanDateFormat().formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <LazyButton
                                    :title="$t('action.edit')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="openEditDialog(row)"
                                >
                                    <Icon
                                        name="solar:pen-new-square-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                                <LazyButton
                                    :title="row.isActive ? $t('action.deactivate') : $t('action.activate')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="handleToggleActive(row)"
                                >
                                    <Icon
                                        :name="row.isActive ? 'solar:eye-closed-outline' : 'solar:eye-outline'"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                                <LazyButton
                                    :title="$t('action.delete')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
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

        <LazySpeakerFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-speaker="editingSpeaker"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

<script setup lang="ts">
import type { EventData, TableHeaderItem } from '~/types';

const { t } = useI18n();
const router = useRouter();
const { formatDate } = useGermanDateFormat();

// Page configuration
const pageTitle = computed(() => t('academy.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('academy.description'));

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
    items: events,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

const headerItems = computed((): TableHeaderItem[] => [
    { as: 'th', name: t('event.title'), id: 'title' },
    { as: 'th', name: t('event.type'), id: 'type' },
    { as: 'th', name: t('event_category.singular'), id: 'eventCategory' },
    { as: 'th', name: t('event_target.singular'), id: 'eventTarget' },
    { as: 'th', name: t('event.max_capacity'), id: 'maxCapacity' },
    { as: 'th', name: t('common.status'), id: 'isActive' },
    { as: 'th', name: t('common.created_at'), id: 'createdAt' },
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
    sortBy.value = 'createdAt';
    sortDir.value = 'desc';
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
    selectedRows.value = [];
};

const handleSearchSubmit = async () => {
    currentPage.value = 1;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
    selectedRows.value = [];
};

const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
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
    });
    selectedRows.value = [];
}

// Dialog state
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingEvent = ref<EventData | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
    dialogMode.value = 'add';
    resetForm();
    editingEvent.value = null;
    isDialogOpen.value = true;
};

const handleEdit = (event: EventData) => {
    dialogMode.value = 'edit';
    editingEvent.value = event;
    setValues({
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription,
        note: event.note || undefined,
        type: (event.type?.toUpperCase?.() || event.type) as any,
        eventCategoryId: (event as any).eventCategoryId || (event as any).categoryId || null,
        eventTargetId: (event as any).eventTargetId || (event as any).targetGroupId || null,
        adminId: (event as any).adminId,
        maxCapacity: (event as any).maxCapacity ?? (event as any).maxTrainee ?? 1,
        room: (event as any).conferenceRoom || (event as any).room || undefined,
        location: event.location || undefined,
        isActive: event.isActive,
    });
    isDialogOpen.value = true;
};

const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(id: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try { await deleteItem(id); }
    catch (error) { console.error('Error deleting event:', error); }
}

async function handleBulkDelete() {
    if (selectedRows.value.length === 0) return;
    const confirmed = await confirmBulkDelete(selectedRows.value.length);
    if (!confirmed) return;
    try {
        await deleteManyItems(selectedRows.value);
        selectedRows.value = [];
    }
    catch (error) { console.error('Error deleting events:', error); }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return events.value.length > 0 && selectedRows.value.length === events.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) selectedRows.value = events.value.map(ev => String(ev.id));
    else selectedRows.value = [];
};

const handleRowSelected = (id: string, checked: boolean) => {
    if (checked) selectedRows.value.push(id);
    else selectedRows.value = selectedRows.value.filter(rowId => rowId !== id);
};

// Submit handlers (pages trigger create/update via dialog emits)
const onSubmitAndClose = async (values: EventForm) => {
    isSubmitting.value = true;
    try {
        if (editingEvent.value) await updateItem(editingEvent.value.id, values);
        else await createItem(values);
        selectedRows.value = [];
        isDialogOpen.value = false;
        editingEvent.value = null;
        resetForm();
    }
    catch (error) {
        console.error('Error submitting event:', error);
    }
    finally { isSubmitting.value = false; }
};

const onSubmitAndAddNew = async (values: EventForm) => {
    isSubmitting.value = true;
    try {
        if (editingEvent.value) {
            await updateItem(editingEvent.value.id, values);
            editingEvent.value = null;
            dialogMode.value = 'add';
        }
        else {
            await createItem(values);
            dialogMode.value = 'edit';
            await nextTick();
            dialogMode.value = 'add';
        }
        selectedRows.value = [];
        resetForm();
    }
    catch (error) {
        console.error('Error submitting event:', error);
    }
    finally { isSubmitting.value = false; }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingEvent.value = null;
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:calendar-outline'"
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
                    v-if="events.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('event.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems"
                        :rows="events.map((ev: EventData) => ({ ...ev, selected: selectedRows.includes(String(ev.id)) }))"
                        :selected-rows="selectedRows"
                        :loading="isLoading"
                        :skeleton-rows="perPage"
                        :selectable="true"
                        :params="{ page: currentPage, length: perPage, sortBy, sortDir, search: searchQuery }"
                        :model-value="isAllSelected"
                        @toggle-sort="handleSortChange"
                        @row-selected="(id: number | string, checked: boolean) => handleRowSelected(String(id), checked)"
                        @update:selected-rows="(rows: (string | number)[]) => selectedRows = rows.map(String)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-title="{ row }">
                            <div class="font-medium">
                                <NuxtLink
                                    :to="`/events/${row.id}/show`"
                                    class="text-primary hover:underline"
                                >
                                    {{ row.title }}
                                </NuxtLink>
                            </div>
                        </template>

                        <template #cell-type="{ row }">
                            <Badge variant="outline">
                                {{ (row.type || '').toString() }}
                            </Badge>
                        </template>

                        <template #cell-eventCategory="{ row }">
                            <span v-if="row.eventCategory">{{ row.eventCategory.name }}</span>
                            <span
                                v-else
                                class="text-muted-foreground"
                            >{{ $t('common.not_assigned') }}</span>
                        </template>

                        <template #cell-eventTarget="{ row }">
                            <span v-if="row.eventTarget">{{ row.eventTarget.name }}</span>
                            <span
                                v-else
                                class="text-muted-foreground"
                            >{{ $t('common.not_assigned') }}</span>
                        </template>

                        <template #cell-maxCapacity="{ row }">
                            <Badge variant="secondary">
                                {{ row.maxCapacity || 0 }}
                            </Badge>
                        </template>

                        <template #cell-isActive="{ row }">
                            <Badge :variant="row.isActive ? 'default' : 'secondary'">
                                {{ row.isActive ? $t('common.active') : $t('common.inactive') }}
                            </Badge>
                        </template>

                        <template #cell-createdAt="{ row }">
                            {{ formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <LazyButton
                                    :title="$t('action.view')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="router.push(`/events/${row.id}/show`)"
                                >
                                    <Icon
                                        name="solar:eye-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
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

        <LazyEventFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-event="editingEvent"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

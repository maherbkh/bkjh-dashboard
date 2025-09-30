<script setup lang="ts">
import type {
    SupportTicket,
    TicketStatus,
    TableHeaderItem,
    ServerParamsTypes,
} from '~/types';

const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('ticket.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('ticket.plural'));
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
    items: tickets,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<SupportTicket, TicketForm>({
    crudPath: 'tickets',
    tenant: 'support',
    formSchema: createTicketSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

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

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('common.number'),
        id: 'ticketNumber',
    },
    {
        as: 'th',
        name: t('requester.name'),
        id: 'requester',
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'status',
    },
    {
        as: 'th',
        name: t('category.singular'),
        id: 'category',
    },
    {
        as: 'th',
        name: t('group.singular'),
        id: 'group',
    },
    {
        as: 'th',
        name: t('common.created_at'),
        id: 'createdAt',
    },
]);

// Dialog state management
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingTicket = ref<SupportTicket | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
    dialogMode.value = 'add';
    resetForm();
    editingTicket.value = null;
    isDialogOpen.value = true;
};

const handleEdit = async (ticket: SupportTicket) => {
    dialogMode.value = 'edit';
    editingTicket.value = ticket;
    setValues({
        requester: {
            name: ticket.requester.name,
            email: ticket.requester.email,
            phone: ticket.requester.phone,
            cell: ticket.requester.cell,
        },
        groupId: ticket.groupId,
        ticketCategoryId: ticket.ticketCategoryId,
        message: ticket.message,
        type: ticket.type,
        adminId: ticket.adminId,
        deviceId: ticket.deviceId,
    });
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: TicketForm) => {
    isSubmitting.value = true;
    try {
        if (editingTicket.value) {
            // Edit existing ticket
            await updateItem(editingTicket.value.id, values);
        }
        else {
            // Add a new ticket
            await createItem(values);
        }
        selectedRows.value = [];

        // Close dialog on success
        isDialogOpen.value = false;
        editingTicket.value = null;
        resetForm();
    }
    catch (error) {
        console.error('Error submitting form:', error);
    // Keep dialog open to show errors - error handling is done in the CRUD composable
    // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false;
    }
};

const onSubmitAndAddNew = async (values: TicketForm) => {
    isSubmitting.value = true;
    try {
        if (editingTicket.value) {
            // Edit existing ticket
            await updateItem(editingTicket.value.id, values);
            // After update, switch to add mode
            editingTicket.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add a new ticket
            await createItem(values);
            // Force form reset by temporarily changing dialogMode to trigger the watcher
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
    editingTicket.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(ticketId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(ticketId);
    // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error deleting ticket:', error);
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
        console.error('Error deleting tickets:', error);
    }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return tickets.value.length > 0 && selectedRows.value.length === tickets.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = tickets.value.map(ticket => String(ticket.id));
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

// Helper function to get latest status
const getLatestStatus = (statuses: TicketStatus[]) => {
    if (!statuses || statuses.length === 0) return null;
    return statuses.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'secondary';
        case 'IN_PROGRESS':
            return 'default';
        case 'RESOLVED':
            return 'success';
        case 'CLOSED':
            return 'outline';
        case 'CANCELLED':
            return 'destructive';
        default:
            return 'secondary';
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:ticket-outline'"
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
                    v-if="tickets.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="
                        $t('action.add') + ' ' + $t('common.new') + ' ' + $t('ticket.singular')
                    "
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="tickets.map((ticket: SupportTicket) => ({
                            ...ticket,
                            selected: selectedRows.includes(String(ticket.id)),
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
                        <template #cell-ticketNumber="{ row }">
                            <div class="font-medium">
                                <NuxtLink
                                    :to="`/support-tickets/${row.id}`"
                                    class="hover:text-primary hover:underline"
                                >
                                    {{ row.ticketNumber }}
                                </NuxtLink>
                            </div>
                        </template>

                        <template #cell-requester="{ row }">
                            <div class="font-medium">
                                {{ row.requester.name }}
                                <Icon
                                    v-if="row.attachments && row.attachments.length > 0"
                                    title="Has Attachments"
                                    name="solar:folder-favourite-bookmark-bold-duotone"
                                    class="!size-4 text-success shrink-0 ml-1.5"
                                />
                            </div>
                            <div class="text-muted-foreground text-sm">
                                {{ row.requester.email }}
                            </div>
                        </template>

                        <template #cell-status="{ row }">
                            <Badge
                                v-if="row.statuses"
                                :variant="
                                    getStatusVariant(getLatestStatus(row.statuses)?.status || 'PENDING')
                                "
                            >
                                {{
                                    $t(
                                        `common.${getLatestStatus(
                                            row.statuses,
                                        )?.status?.toLowerCase()}`,
                                    )
                                }}
                            </Badge>
                        </template>

                        <template #cell-category="{ row }">
                            <span v-if="row.ticketCategory">
                                {{ row.ticketCategory.name }}
                            </span>
                            <span
                                v-else
                                class="text-muted-foreground"
                            >
                                {{ $t("common.not_assigned") }}
                            </span>
                        </template>

                        <template #cell-group="{ row }">
                            <span v-if="row.group">
                                {{ row.group.name }}
                            </span>
                            <span
                                v-else
                                class="text-muted-foreground"
                            >
                                {{ $t("common.not_assigned") }}
                            </span>
                        </template>

                        <template #cell-createdAt="{ row }">
                            {{ useGermanDateFormat().formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <NuxtLink :to="`/support-tickets/${row.id}`">
                                    <LazyButton
                                        :title="$t('action.view')"
                                        variant="ghost"
                                        size="icon"
                                        hydrate-on-interaction="mouseover"
                                    >
                                        <Icon
                                            name="solar:eye-outline"
                                            class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                        />
                                    </LazyButton>
                                </NuxtLink>
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

        <LazyTicketFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-ticket="editingTicket"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

<script setup lang="ts">
import type { Ticket, TicketAction, TableHeaderItem, ServerParamsTypes } from '~/types'

const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('ticket.plural'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('ticket.plural'))
definePageMeta({
    middleware: 'auth',
})

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
})

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
} = useCrud<Ticket, TicketCrudForm>({
    crudPath: 'ticket',
    tenant: 'support',
    formSchema: createTicketCrudSchema(t),
})

const selectedRows = ref<number[]>([])

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(25)
const sortBy = ref('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')

// Use German date formatting composable

// Initialize data
await fetchItems(currentPage.value, perPage.value)

const handleReset = async () => {
    searchQuery.value = ''
    currentPage.value = 1
    sortBy.value = 'created_at'
    sortDir.value = 'desc'
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    selectedRows.value = []
}

const handleSearchSubmit = async () => {
    currentPage.value = 1
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    selectedRows.value = []
}

const handlePageChange = async (page: number) => {
    currentPage.value = page
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    selectedRows.value = []
}

async function handleSortChange(dir: 'asc' | 'desc', id: string) {
    sortDir.value = dir
    sortBy.value = id
    currentPage.value = 1
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    selectedRows.value = []
}

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('common.number'),
        id: 'ticketNumber',
    },
    {
        as: 'th',
        name: t('global.name'),
        id: 'name',
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
        id: 'created_at',
    },
])

// Dialog state management
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingTicket = ref<Ticket | null>(null)
const isSubmitting = ref(false)

const openAddDialog = () => {
    dialogMode.value = 'add'
    resetForm()
    editingTicket.value = null
    isDialogOpen.value = true
}

const handleEdit = async (ticket: Ticket) => {
    dialogMode.value = 'edit'
    editingTicket.value = ticket
    setValues({
        name: ticket.name,
        message: ticket.message,
        email: ticket.email || '',
        phone: ticket.phone || '',
        cell: ticket.cell || '',
        deviceId: ticket.deviceId || '',
        groupId: ticket.group?.id || null,
        categoryId: ticket.category?.id || null,
        status: ticket.status,
    })
    isDialogOpen.value = true
}

const onSubmitAndClose = async (values: TicketCrudForm) => {
    isSubmitting.value = true
    try {
        if (editingTicket.value) {
            // Edit existing ticket
            await updateItem(editingTicket.value.id, values)
        }
        else {
            // Add a new ticket
            await createItem(values)
        }
        selectedRows.value = []

        // Close dialog on success
        isDialogOpen.value = false
        editingTicket.value = null
        resetForm()
    }
    catch (error) {
        console.error('Error submitting form:', error)
        // Keep dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false
    }
}

const onSubmitAndAddNew = async (values: TicketCrudForm) => {
    isSubmitting.value = true
    try {
        if (editingTicket.value) {
            // Edit existing ticket
            await updateItem(editingTicket.value.id, values)
            // After update, switch to add mode
            editingTicket.value = null
            dialogMode.value = 'add'
        }
        else {
            // Add a new ticket
            await createItem(values)
            // Force form reset by temporarily changing dialogMode to trigger the watcher
            dialogMode.value = 'edit'
            await nextTick()
            dialogMode.value = 'add'
        }
        selectedRows.value = []

        // Reset form but keep dialog open for adding new item
        resetForm()
    }
    catch (error) {
        console.error('Error submitting form:', error)
        // Keep dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false
    }
}

const handleDialogClose = () => {
    isDialogOpen.value = false
    resetForm()
    editingTicket.value = null
}

const { confirmDelete, confirmBulkDelete } = useConfirmDialog()

const handleDelete = async (id: string | number) => {
    const confirmed = await confirmDelete()
    if (confirmed) {
        try {
            await deleteItem(id)
            selectedRows.value = []
        }
        catch (error) {
            console.error('Error deleting ticket:', error)
        }
    }
}

const handleBulkDelete = async () => {
    const confirmed = await confirmBulkDelete(selectedRows.value.length)
    if (confirmed) {
        try {
            await deleteManyItems(selectedRows.value)
            selectedRows.value = []
        }
        catch (error) {
            console.error('Error deleting tickets:', error)
        }
    }
}

const handleRowSelected = (rowId: number, checked: boolean) => {
    if (checked) {
        selectedRows.value.push(rowId)
    }
    else {
        const index = selectedRows.value.indexOf(rowId)
        if (index > -1) {
            selectedRows.value.splice(index, 1)
        }
    }
}

const isAllSelected = computed(() => {
    if (tickets.value.length === 0) return false
    return tickets.value.every(ticket => selectedRows.value.includes(ticket.id))
})

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = tickets.value.map(ticket => ticket.id)
    }
    else {
        selectedRows.value = []
    }
}

// Helper function to get latest status
const getLatestStatus = (actionsHistory: TicketAction[]) => {
    if (!actionsHistory || actionsHistory.length === 0) return null
    return actionsHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
}

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'pending':
            return 'secondary'
        case 'in_progress':
            return 'default'
        case 'resolved':
            return 'success'
        case 'closed':
            return 'outline'
        default:
            return 'secondary'
    }
}
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
                    v-if="tickets.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('ticket.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="tickets.map((ticket: Ticket) => ({
                            ...ticket,
                            selected: selectedRows.includes(ticket.id),
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
                        @row-selected="(id: string | number, checked: boolean) => handleRowSelected(Number(id), checked)"
                        @update:selected-rows="(rows: (string | number)[]) => selectedRows = rows.map(Number)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-ticketNumber="{ row }">
                            <div class="font-medium">
                                <NuxtLink
                                    :to="`/support-tickets/${row.uuid}`"
                                    class="text-primary hover:underline"
                                >
                                    {{ row.ticketNumber }}
                                </NuxtLink>
                            </div>
                        </template>

                        <template #cell-name="{ row }">
                            <div class="font-medium">
                                {{ row.name }}
                            </div>
                            <div class="text-muted-foreground text-sm truncate max-w-[200px]">
                                {{ row.message }}
                            </div>
                        </template>

                        <template #cell-status="{ row }">
                            <Badge
                                v-if="row.actionsHistory"
                                :variant="getStatusVariant(getLatestStatus(row.actionsHistory)?.status || 'pending')"
                            >
                                {{ $t(`common.${getLatestStatus(row.actionsHistory)?.status}`) }}
                            </Badge>
                        </template>

                        <template #cell-category="{ row }">
                            <span v-if="row.category">
                                {{ row.category.name }}
                            </span>
                            <span
                                v-else
                                class="text-muted-foreground"
                            >
                                {{ $t('common.not_assigned') }}
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
                                {{ $t('common.not_assigned') }}
                            </span>
                        </template>

                        <template #cell-created_at="{ row }">
                            {{ useGermanDateFormat().formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <LazyButton
                                    :title="$t('action.view')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="$router.push(`/support-tickets/${row.uuid}`)"
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

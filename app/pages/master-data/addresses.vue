<script setup lang="ts">
import type { Address, TableHeaderItem, ServerParamsTypes } from '~/types'

const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('addresses.title'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('addresses.description'))
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
    items: addresses,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Address, AddressForm>({
    apiSlug: 'address',
    formSchema: createAddressSchema(t),
})

const selectedRows = ref<number[]>([])

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(25)
const sortBy = ref('street')
const sortDir = ref<'asc' | 'desc'>('asc')

// Computed properties
const status = computed(() => isLoading.value ? 'pending' : 'success')

// Initialize data
await fetchItems(currentPage.value, perPage.value)

const handleReset = async () => {
    searchQuery.value = ''
    currentPage.value = 1
    sortBy.value = 'name'
    sortDir.value = 'asc'
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
        name: t('global.table.street'),
        id: 'street',
    },
    {
        as: 'th',
        name: t('global.table.created_at'),
        id: 'created_at',
    },
])

// Dialog state management
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingAddress = ref<Address | null>(null)
const isSubmitting = ref(false)

const openAddDialog = () => {
    dialogMode.value = 'add'
    resetForm()
    editingAddress.value = null
    isDialogOpen.value = true
}

const handleEdit = async (address: Address) => {
    dialogMode.value = 'edit'
    editingAddress.value = address
    setValues({
        street: address.street,
    })
    isDialogOpen.value = true
}

const onSubmitAndClose = async (values: AddressForm) => {
    isSubmitting.value = true
    try {
        if (editingAddress.value) {
            // Edit existing address
            await updateItem(editingAddress.value.id, values)
        }
        else {
            // Add new address
            await createItem(values)
        }
        selectedRows.value = []

        // Close dialog on success
        isDialogOpen.value = false
        editingAddress.value = null
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

const onSubmitAndAddNew = async (values: AddressForm) => {
    isSubmitting.value = true
    try {
        if (editingAddress.value) {
            // Edit existing address
            await updateItem(editingAddress.value.id, values)
            // After update, switch to add mode
            editingAddress.value = null
            dialogMode.value = 'add'
        }
        else {
            // Add new address
            await createItem(values)
            // Force form reset by temporarily changing dialogMode to trigger watcher
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
    editingAddress.value = null
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
            console.error('Error deleting address:', error)
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
            console.error('Error deleting addresses:', error)
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
    if (addresses.value.length === 0) return false
    return addresses.value.every(address => selectedRows.value.includes(address.id))
})

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = addresses.value.map(address => address.id)
    }
    else {
        selectedRows.value = []
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:align-horizonta-spacing-outline'"
            @add-new="openAddDialog"
        >
            <template #actions>
                <Button
                    v-if="selectedRows.length > 0"
                    class="cursor-pointer"
                    variant="destructive"
                    size="sm"
                    @click="handleBulkDelete"
                >
                    <Icon
                        name="solar:trash-bin-minimalistic-outline"
                    />
                    {{ $t('global.actions.delete_all') }}
                </Button>
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
                    v-if="addresses.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('global.forms.add_new')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="addresses.map((address: Address) => ({
                            ...address,
                            selected: selectedRows.includes(address.id),
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
                        <template #cell-street="{ row }">
                            <div class="font-medium">
                                <span>{{ row.street }},</span>
                                <span class="ml-1">{{ row.number }}</span>
                            </div>
                            <div class="text-muted-foreground text-sm">
                                <span class="mr-1 font-semibold">{{ row.postalCode }},</span>
                                <span>{{ row.city }}</span>
                            </div>
                        </template>

                        <template #cell-created_at="{ row }">
                            {{ useGermanDateFormat().formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <Button
                                    :title="$t('global.actions.edit')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="handleEdit(row)"
                                >
                                    <Icon
                                        name="solar:pen-new-square-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </Button>
                                <Button
                                    :title="$t('global.actions.delete')"
                                    variant="ghost"
                                    size="icon"
                                    @click="handleDelete(row.id)"
                                >
                                    <Icon
                                        name="solar:trash-bin-trash-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-destructive"
                                    />
                                </Button>
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

        <LazyAddressFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-address="editingAddress"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

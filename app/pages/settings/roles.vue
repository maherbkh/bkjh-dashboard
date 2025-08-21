<script setup lang="ts">
import type { Role, TableHeaderItem, ServerParamsTypes } from '~/types'
import type { RoleForm } from '~/composables/roleSchema'

const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('roles.title'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('roles.description'))
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
    items: roles,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Role, RoleForm>({
    apiSlug: 'role',
    formSchema: createRoleSchema(t),
})

const selectedRows = ref<number[]>([])

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(25)
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')

// Computed properties
const status = computed(() => isLoading.value ? 'pending' : 'success')

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('global.table.name'),
        id: 'name',
    },
    {
        as: 'th',
        name: t('global.table.status'),
        id: 'is_active',
    },
    {
        as: 'th',
        name: t('roles.table.permissions'),
        id: 'permissions',
    },
    {
        as: 'th',
        name: t('roles.table.users_count'),
        id: 'users_count',
    },
    {
        as: 'th',
        name: t('global.table.created_at'),
        id: 'created_at',
    },
])

// Initialize data
await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,

})

// Dialog state management
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingRole = ref<Role | null>(null)
const isSubmitting = ref(false)

const openAddDialog = () => {
    dialogMode.value = 'add'
    resetForm()
    editingRole.value = null
    isDialogOpen.value = true
}

const handleEdit = async (role: Role) => {
    dialogMode.value = 'edit'
    editingRole.value = role
    setValues({
        name: role.name,
        slug: role.slug,
        is_active: role.is_active,
        position: role.position,
        permission_ids: role.permissions?.map(p => p.id) || [],
    })
    isDialogOpen.value = true
}

const onSubmitAndClose = async (values: RoleForm) => {
    isSubmitting.value = true
    try {
        if (editingRole.value) {
            // Edit existing role
            await updateItem(editingRole.value.id, values)
        }
        else {
            // Add new role
            await createItem(values)
        }
        selectedRows.value = []

        // Close dialog on success
        isDialogOpen.value = false
        editingRole.value = null
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

const onSubmitAndAddNew = async (values: RoleForm) => {
    isSubmitting.value = true
    try {
        if (editingRole.value) {
            // Edit existing role
            await updateItem(editingRole.value.id, values)
            // After update, switch to add mode
            editingRole.value = null
            dialogMode.value = 'add'
        }
        else {
            // Add new role
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
    editingRole.value = null
}

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog()

async function handleDelete(roleId: number) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    try {
        await deleteItem(roleId)
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,

        })
    }
    catch (error) {
        console.error('Error deleting role:', error)
    }
}

async function handleBulkDelete() {
    if (selectedRows.value.length === 0) return

    const confirmed = await confirmBulkDelete(selectedRows.value.length)
    if (!confirmed) return

    try {
        await deleteManyItems(selectedRows.value)
        selectedRows.value = []
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,

        })
    }
    catch (error) {
        console.error('Error deleting roles:', error)
    }
}

// Search and pagination handlers
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

// Row selection handlers
const isAllSelected = computed(() => {
    return roles.value.length > 0 && selectedRows.value.length === roles.value.length
})

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = roles.value.map(role => role.id)
    }
    else {
        selectedRows.value = []
    }
}

const handleRowSelected = (id: number, checked: boolean) => {
    if (checked) {
        selectedRows.value.push(id)
    }
    else {
        selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:shield-keyhole-outline'"
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
                    v-if="roles.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('global.forms.add_new')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="roles.map(role => ({
                            ...role,
                            selected: selectedRows.includes(role.id),
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
                        @row-selected="(id, checked) => handleRowSelected(Number(id), checked)"
                        @update:selected-rows="(rows) => selectedRows = rows.map(Number)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-name="{ row }">
                            <div class="font-medium">
                                {{ row.name }}
                            </div>
                        </template>
                        <template #cell-is_active="{ row }">
                            <Badge
                                :variant="row.isActive ? 'default' : 'secondary'"
                                class="text-xs"
                            >
                                {{ row.isActive ? $t('global.status.active') : $t('global.status.inactive') }}
                            </Badge>
                        </template>

                        <template #cell-permissions="{ row }">
                            <div class="text-sm">
                                <div
                                    v-if="row.permissions && row.permissions.length > 0"
                                    class="flex flex-wrap gap-1"
                                >
                                    <Badge
                                        v-for="permission in row.permissions.slice(0, 3)"
                                        :key="permission.id"
                                        variant="outline"
                                        class="text-xs"
                                    >
                                        {{ permission.name }}
                                    </Badge>
                                    <span
                                        v-if="row.permissions.length > 3"
                                        class="text-muted-foreground text-xs"
                                    >
                                        +{{ row.permissions.length - 3 }}
                                    </span>
                                </div>
                                <span
                                    v-else
                                    class="text-muted-foreground text-xs"
                                >
                                    {{ $t('roles.no_permissions') }}
                                </span>
                            </div>
                        </template>

                        <template #cell-users_count="{ row }">
                            <div class="text-sm">
                                {{ row.users_count || 0 }} {{ $t('roles.users') }}
                            </div>
                        </template>

                        <template #cell-created_at="{ row }">
                            {{ useGermanDateFormat().formatDate(row.created_at) }}
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

        <LazyRoleFormDialog 
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-role="editingRole"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template> 
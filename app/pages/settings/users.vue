<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('user.plural'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('user.plural'))
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
    items: users,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<User, UserForm>({
    apiSlug: 'user',
    formSchema: createUserSchema(t),
})

const selectedRows = ref<number[]>([])

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(25)
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('global.name'),
        id: 'name',
    },
    {
        as: 'th',
        name: t('form.email'),
        id: 'email',
    },
    {
        as: 'th',
        name: t('user.username'),
        id: 'username',
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'isActive',
    },
    {
        as: 'th',
        name: t('role.singular'),
        id: 'isSuperAdmin',
    },
    {
        as: 'th',
        name: t('common.created_at'),
        id: 'createdAt',
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
const editingUser = ref<User | null>(null)
const isSubmitting = ref(false)

// Roles state
const roles = ref<Array<{ id: number; name: string; position: number }>>([])
const isRolesLoading = ref(false)

const openAddDialog = async () => {
    dialogMode.value = 'add'
    resetForm()
    editingUser.value = null
    
    // Fetch roles when opening dialog
    if (roles.value.length === 0) {
        isRolesLoading.value = true
        try {
            const { data, status } = await useApiFetch<{
                status: string;
                message: string;
                data: Array<{ id: number; name: string; position: number }>;
            }>('/api/role-all');
            
            // Only proceed if status is not pending
            if (status.value !== 'pending') {
                if (data.value?.data) {
                    roles.value = data.value.data
                }
                isDialogOpen.value = true
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        } finally {
            isRolesLoading.value = false
        }
    } else {
        // If roles are already loaded, open dialog immediately
        isDialogOpen.value = true
    }
}

const handleEdit = async (user: User) => {
    dialogMode.value = 'edit'
    editingUser.value = user
    
    // Fetch roles when opening dialog if not already loaded
    if (roles.value.length === 0) {
        isRolesLoading.value = true
        try {
            const { data, status } = await useApiFetch<{
                status: string;
                message: string;
                data: Array<{ id: number; name: string; position: number }>;
            }>('/api/role-all');
            
            // Only proceed if status is not pending
            if (status.value !== 'pending') {
                if (data.value?.data) {
                    roles.value = data.value.data
                }
                
                setValues({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    name: user.name || '',
                    isActive: user.isActive || true,
                    isSuperAdmin: user.isSuperAdmin || false,
                })
                isDialogOpen.value = true
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        } finally {
            isRolesLoading.value = false
        }
    } else {
        // If roles are already loaded, set values and open dialog immediately
        setValues({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            name: user.name || '',
            isActive: user.isActive || true,
            isSuperAdmin: user.isSuperAdmin || false,
        })
        isDialogOpen.value = true
    }
}

const onSubmitAndClose = async (values: UserForm) => {
    isSubmitting.value = true
    try {
        if (editingUser.value) {
            // Edit existing user
            await updateItem(editingUser.value.id, values)
        }
        else {
            // Add new user
            await createItem(values)
        }
        selectedRows.value = []

        // Close dialog on success
        isDialogOpen.value = false
        editingUser.value = null
        resetForm()
    }
    catch (error) {
        console.error('Error submitting form:', error)
        // Keep the dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false
    }
}

const onSubmitAndAddNew = async (values: UserForm) => {
    isSubmitting.value = true
    try {
        if (editingUser.value) {
            // Edit existing user
            await updateItem(editingUser.value.id, values)
            // After the update, switch to add mode
            editingUser.value = null
            dialogMode.value = 'add'
        }
        else {
            // Add new user
            await createItem(values)
            // Force form reset by temporarily changing dialogMode to trigger the watcher
            dialogMode.value = 'edit'
            await nextTick()
            dialogMode.value = 'add'
        }
        selectedRows.value = []

        // Reset form but keep the dialog open for adding new item
        resetForm()
    }
    catch (error) {
        console.error('Error submitting form:', error)
        // Keep the dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false
    }
}

const handleDialogClose = () => {
    isDialogOpen.value = false
    resetForm()
    editingUser.value = null
}

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog()

async function handleDelete(userId: number) {
  console.log('handleDelete called with userId:', userId)
    const confirmed = await confirmDelete()
    if (!confirmed) return
console.log('handleDelete confirmed')
    try {
        await deleteItem(userId)
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        })
    }
    catch (error) {
        console.error('Error deleting user:', error)
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
        console.error('Error deleting users:', error)
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
    return users.value.length > 0 && selectedRows.value.length === users.value.length
})

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = users.value.map(user => user.id)
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
            :page-icon="pageIcon || 'solar:users-group-rounded-outline'"
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
                    v-if="users.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('global.forms.add_new')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="users.map(user => ({
                            ...user,
                            selected: selectedRows.includes(user.id),
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
                            <div class="font-medium flex items-center gap-2">
                                <div>{{ row.name || `${row.firstName} ${row.lastName}` }}</div>
                                <Icon v-if="row.meta?.isOnline" name="solar:user-circle-outline" class="!size-4 rounded-full shrink-0 text-success"/>
                            </div>
                        </template>

                        <template #cell-email="{ row }">
                            <div class="text-sm">
                                {{ row.email }}
                            </div>
                        </template>

                        <template #cell-username="{ row }">
                            <div class="text-sm">
                                {{ row.username }}
                            </div>
                        </template>

                        <template #cell-isActive="{ row }">
                            <Badge
                                :variant="row.isActive ? 'default' : 'secondary'"
                                class="text-xs"
                            >
                                {{ row.isActive ? $t('common.active') : $t('common.inactive') }}
                            </Badge>
                        </template>

                        <template #cell-isSuperAdmin="{ row }">
                            <Badge
                                :variant="row.isSuperAdmin ? 'secondary' : 'outline'"
                                class="text-xs"
                            >
                                {{ row.isSuperAdmin ? $t('user.super_admin') : $t('role.singular') }}
                            </Badge>
                        </template>

                        <template #cell-createdAt="{ row }">
                            {{ useGermanDateFormat().formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <Button
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
                                </Button>
                                <Button
                                    :title="$t('action.delete')"
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

        <LazyUserFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-user="editingUser"
            :is-submitting="isSubmitting"
            :roles="roles"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

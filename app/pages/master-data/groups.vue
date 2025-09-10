<script setup lang="ts">
const { t } = useI18n()
const { confirmDelete, confirmBulkDelete } = useConfirmDialog()

// Page configuration
const pageTitle = computed(() => t('group.plural'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('group.plural'))
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
    items: groups,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Group, GroupForm>({
    crudPath: 'group',
    tenant: 'shared',
    formSchema: createGroupSchema(t),
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
        name: t('global.name'),
        id: 'name',
    },
    {
        as: 'th',
        name: t('address.singular'),
        id: 'address',
    },
    {
        as: 'th',
        name: t('company.singular'),
        id: 'companies',
    },
    {
        as: 'th',
        name: t('common.created_at'),
        id: 'created_at',
    },
])

// Initialize data
await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
})

// Dialog state
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingGroup = ref<Group | null>(null)

// Dialog functions
function openAddDialog() {
    dialogMode.value = 'add'
    editingGroup.value = null
    isDialogOpen.value = true
}

function handleEdit(group: Group) {
    dialogMode.value = 'edit'
    editingGroup.value = { ...group }
    isDialogOpen.value = true
}

// Form submission handlers
async function handleGroupCreated(group: Group) {
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    isDialogOpen.value = false
    editingGroup.value = null
}

async function handleGroupUpdated(group: Group) {
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    isDialogOpen.value = false
    editingGroup.value = null
}

// Delete handlers
async function handleDelete(groupId: number) {
    const confirmed = await confirmDelete()
    if (!confirmed) return

    try {
        await deleteItem(groupId)
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        })
    }
    catch (error) {
        console.error('Error deleting group:', error)
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
        console.error('Error bulk deleting groups:', error)
    }
}

// Search and pagination handlers
async function handleSearchSubmit() {
    currentPage.value = 1
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
}

async function handleReset() {
    searchQuery.value = ''
    currentPage.value = 1
    await fetchItems(currentPage.value, perPage.value, {
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
}

async function handlePageChange(page: number) {
    currentPage.value = page
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    })
    selectedRows.value = []
}

async function handleSort(column: string, direction: 'asc' | 'desc') {
    sortBy.value = column
    sortDir.value = direction
    currentPage.value = 1
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

const handleRowSelected = (id: number, checked: boolean) => {
    if (checked) {
        selectedRows.value.push(id)
    }
    else {
        selectedRows.value = selectedRows.value.filter(rowId => rowId !== id)
    }
}

const isAllSelected = computed(() => {
    if (groups.value.length === 0) return false
    return groups.value.every(group => selectedRows.value.includes(group.id))
})

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = groups.value.map(group => group.id)
    }
    else {
        selectedRows.value = []
    }
}
</script>

<template>
    <div>
        <div class="flex flex-col gap-4">
            <PageHeaderActions
                :page-title="pageTitle"
                :page-icon="pageIcon || 'solar:users-group-rounded-outline'"
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
                <PageEmptyState
                    v-if="status === 'success' && groups.length === 0 && !searchQuery"
                    :title="$t('groups.empty.title')"
                    :description="$t('groups.empty.description')"
                    :action-text="$t('groups.empty.action')"
                    @action="openAddDialog"
                />
                <PageTable
                    v-else-if="groups.length > 0"
                    :header-items="headerItems"
                    :rows="groups.map(group => ({
                        ...group,
                        selected: selectedRows.includes(group.id),
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
                    @row-selected="(id, checked) => handleRowSelected(Number(id), checked)"
                    @update:selected-rows="(rows) => selectedRows = rows.map(Number)"
                    @update:model-value="handleSelectAll"
                >
                    <template #cell-name="{ row }">
                        <div class="font-medium">
                            {{ row.name }}
                        </div>
                    </template>

                    <template #cell-address="{ row }">
                        <div
                            v-if="row.address"
                            class="text-sm"
                        >
                            {{ row.address.street }} {{ row.address.number }}<br>
                            {{ row.address.postalCode }} {{ row.address.city }}
                        </div>
                        <span
                            v-else
                            class="text-muted-foreground"
                        >{{ $t('global.common.no_address') }}</span>
                    </template>

                    <template #cell-companies="{ row }">
                        <div
                            v-if="row.companies && row.companies.length > 0"
                            class="text-sm"
                        >
                            <div
                                v-for="company in row.companies.slice(0, 2)"
                                :key="company.id"
                            >
                                {{ company.name }}
                            </div>
                            <span
                                v-if="row.companies.length > 2"
                                class="text-muted-foreground"
                            >
                                +{{ row.companies.length - 2 }} {{ $t('global.common.more') }}
                            </span>
                        </div>
                        <span
                            v-else
                            class="text-muted-foreground"
                        >{{ $t('global.common.no_companies') }}</span>
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
            </div>
            <div v-if="groups.length > 0">
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
            </div>
        </div>

        <!-- Form Dialog -->
        <LazyGroupFormDialog
            v-model:open="isDialogOpen"
            :mode="dialogMode"
            :editing-group="editingGroup"
            @group-created="handleGroupCreated"
            @group-updated="handleGroupUpdated"
        />
    </div>
</template>

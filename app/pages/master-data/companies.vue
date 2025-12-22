<script setup lang="ts">
const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('company.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('company.plural'));
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
    items: companies,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Company, CompanyForm>({
    crudPath: 'companies',
    tenant: 'shared',
    formSchema: createCompanySchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');

// Computed properties
const status = computed(() => isLoading.value ? 'pending' : 'success');

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
        name: t('global.management'),
        id: 'management',
    },
]);

// Initialize data
await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
}, Date.now());

// Dialog state management
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingCompany = ref<Company | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
    dialogMode.value = 'add';
    resetForm();
    editingCompany.value = null;
    isDialogOpen.value = true;
};

const handleEdit = async (company: Company) => {
    dialogMode.value = 'edit';
    editingCompany.value = company;
    setValues({
        name: company.name,
        location: company.location,
        register: company.register,
        partner: {
            name: company.partner.name,
            location: company.partner.location,
            register: company.partner.register,
        },
        management: company.management,
        addressId: company.address?.id || null,
    });
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: CompanyForm) => {
    isSubmitting.value = true;
    try {
        if (editingCompany.value) {
            // Edit existing company
            await updateItem(editingCompany.value.id, values);
        }
        else {
            // Add new company
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
        editingCompany.value = null;
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

const onSubmitAndAddNew = async (values: CompanyForm) => {
    isSubmitting.value = true;
    try {
        if (editingCompany.value) {
            // Edit existing company
            await updateItem(editingCompany.value.id, values);
            // After update, switch to add mode
            editingCompany.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new company
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
    editingCompany.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(companyId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(companyId);
        // No need to manually refresh - useCrud handles it automatically
    }
    catch (error) {
        console.error('Error deleting company:', error);
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
        console.error('Error deleting companies:', error);
    }
}

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

// Row selection handlers
const isAllSelected = computed(() => {
    return companies.value.length > 0 && selectedRows.value.length === companies.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = companies.value.map(company => company.id);
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
            :page-icon="pageIcon || 'solar:buildings-outline'"
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
                    v-if="companies.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('company.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems"
                        :rows="companies.map((company: Company) => ({
                            ...company,
                            selected: selectedRows.includes(company.id),
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
                        </template>

                        <template #cell-location="{ row }">
                            <div class="text-sm">
                                {{ row.location }}
                            </div>
                        </template>

                        <template #cell-address="{ row }">
                            <div
                                v-if="row.address"
                                class="text-sm"
                            >
                                <div class="font-medium">
                                    {{ row.address.streetName }} {{ row.address.buildingNumber }}
                                </div>
                                <div class="text-muted-foreground">
                                    {{ row.address.postalCode }} {{ row.address.city }}
                                </div>
                            </div>
                            <div
                                v-else
                                class="text-muted-foreground text-sm"
                            >
                                {{ $t('address.no_address_found') }}
                            </div>
                        </template>

                        <template #cell-management="{ row }">
                            <div class="text-sm">
                                {{ row.management }}
                            </div>
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

        <LazyCompanyFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-company="editingCompany"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

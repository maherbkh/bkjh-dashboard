<script setup lang="ts">
import type { Admin, AdminForm, TableHeaderItem, ServerParamsTypes } from '~/types';
import { createAdminSchema } from '~/composables/adminSchema';
import { useResourcesStore } from '~/stores/resources';

const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('admin.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('admin.plural'));
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
    items: admins,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Admin, AdminForm>({
    crudPath: 'admins',
    tenant: 'shared',
    formSchema: createAdminSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

const headerItems = computed(() => [
    {
        as: 'th',
        name: t('global.name'),
        id: 'firstName',
    },
    {
        as: 'th',
        name: t('form.email'),
        id: 'email',
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'isActive',
        sortable: false,
    },
    {
        as: 'th',
        name: t('admin.role'),
        id: 'isSuperAdmin',
        sortable: false,
    },
    {
        as: 'th',
        name: t('admin.apps'),
        id: 'apps',
        sortable: false,
    },
]);

// Initialize data
await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
});

// Dialog state management
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingAdmin = ref<Admin | null>(null);
const isSubmitting = ref(false);

// Resources store for occupations
const resourcesStore = useResourcesStore();

const openAddDialog = async () => {
    dialogMode.value = 'add';
    resetForm();
    editingAdmin.value = null;
    isDialogOpen.value = true;
};

const handleEdit = async (admin: Admin) => {
    dialogMode.value = 'edit';
    editingAdmin.value = admin;

    setValues({
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        occupationId: admin.occupationId || null,
        isActive: admin.isActive || true,
        isSuperAdmin: admin.isSuperAdmin || false,
        apps: admin.apps || ['dashboard'],
    });
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: AdminForm) => {
    isSubmitting.value = true;
    try {
        if (editingAdmin.value) {
            // Edit existing admin
            await updateItem(editingAdmin.value.id, values);
        }
        else {
            // Add new admin
            await createItem(values);
        }
        selectedRows.value = [];

        // Close dialog on success
        isDialogOpen.value = false;
        editingAdmin.value = null;
        resetForm();
    }
    catch (error) {
        console.error('Error submitting form:', error);
        // Keep the dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false;
    }
};

const onSubmitAndAddNew = async (values: AdminForm) => {
    isSubmitting.value = true;
    try {
        if (editingAdmin.value) {
            // Edit existing admin
            await updateItem(editingAdmin.value.id, values);
            // After the update, switch to add mode
            editingAdmin.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new admin
            await createItem(values);
            // Force form reset by temporarily changing dialogMode to trigger the watcher
            dialogMode.value = 'edit';
            await nextTick();
            dialogMode.value = 'add';
        }
        selectedRows.value = [];

        // Reset form but keep the dialog open for adding new item
        resetForm();
    }
    catch (error) {
        console.error('Error submitting form:', error);
        // Keep the dialog open to show errors - error handling is done in the CRUD composable
        // The dialog will remain open, so users can see validation errors or try again
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingAdmin.value = null;
};

// Delete handlers
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(adminId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try {
        await deleteItem(adminId);
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        });
    }
    catch (error) {
        console.error('Error deleting admin:', error);
    }
}

async function handleBulkDelete() {
    if (selectedRows.value.length === 0) return;

    const confirmed = await confirmBulkDelete(selectedRows.value.length);
    if (!confirmed) return;

    try {
        await deleteManyItems(selectedRows.value);
        selectedRows.value = [];
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        });
    }
    catch (error) {
        console.error('Error deleting admins:', error);
    }
}

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

// Row selection handlers
const isAllSelected = computed(() => {
    return admins.value.length > 0 && selectedRows.value.length === admins.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = admins.value.map(admin => admin.id);
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
            <div>
                <PageEmptyState
                    v-if="admins.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('admin.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems as TableHeaderItem[]"
                        :rows="admins.map(admin => ({
                            ...admin,
                            selected: selectedRows.includes(admin.id),
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
                        @row-selected="(id, checked) => handleRowSelected(String(id), checked)"
                        @update:selected-rows="(rows) => selectedRows = rows.map(String)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-firstName="{ row }">
                            <div>
                                <div class="font-medium flex items-center gap-2">
                                    <div>{{ `${row.firstName} ${row.lastName}` }}</div>
                                    <Icon
                                        v-if="row.lastLoginAt"
                                        name="solar:user-circle-outline"
                                        class="!size-4 rounded-full shrink-0 text-success"
                                    />
                                </div>
                                <div
                                    v-if="row.occupation?.name"
                                    class="text-sm"
                                >
                                    {{ row.occupation?.name || '-' }}
                                </div>
                            </div>
                        </template>

                        <template #cell-email="{ row }">
                            <div class="text-sm">
                                {{ row.email }}
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
                                {{ row.isSuperAdmin ? $t('admin.super_admin') : $t('admin.admin') }}
                            </Badge>
                        </template>

                        <template #cell-apps="{ row }">
                            <div class="flex gap-1 flex-wrap">
                                <Badge
                                    v-for="app in row.apps"
                                    :key="app"
                                    variant="outline"
                                    class="text-xs"
                                >
                                    {{ app }}
                                </Badge>
                            </div>
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

        <LazyAdminFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-admin="editingAdmin"
            :is-submitting="isSubmitting"
            :occupations="resourcesStore.occupations"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
        <MediaExample />
    </div>
</template>

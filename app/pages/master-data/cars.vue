<script setup lang="ts">
import type { Car, CarForm, TableHeaderItem } from '~/types';

const { t } = useI18n();
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();
const pageIcon = usePageIcon();

const pageTitle = computed(() => t('car.plural'));
const pageDescription = computed(() => t('car.description'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

const {
    items: cars,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Car, CarForm>({
    crudPath: 'cars',
    tenant: 'booking',
    formSchema: createCarSchema(t),
});

const selectedRows = ref<string[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

const headerItems = computed((): TableHeaderItem[] => [
    {
        as: 'th',
        name: t('car.model'),
        id: 'model',
    },
    {
        as: 'th',
        name: t('car.plate_number'),
        id: 'plateNumber',
    },
    {
        as: 'th',
        name: t('car.type'),
        id: 'type',
    },
    {
        as: 'th',
        name: t('car.automatic'),
        id: 'automatic',
    },
    {
        as: 'th',
        name: t('car.is_active'),
        id: 'isActive',
    },
    {
        as: 'th',
        name: t('car.max'),
        id: 'max',
    },
]);

await fetchItems(currentPage.value, perPage.value, {
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
}, Date.now());

const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingCar = ref<Car | null>(null);
const isSubmitting = ref(false);

const openAddDialog = () => {
    dialogMode.value = 'add';
    resetForm();
    editingCar.value = null;
    isDialogOpen.value = true;
};

const handleEdit = async (car: Car) => {
    dialogMode.value = 'edit';
    editingCar.value = car;
    setValues({
        model: car.model,
        plateNumber: car.plateNumber,
        type: car.type,
        automatic: car.automatic,
        isActive: car.isActive,
        max: car.max,
    });
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: CarForm) => {
    isSubmitting.value = true;
    try {
        if (editingCar.value) {
            await updateItem(editingCar.value.id, values);
        }
        else {
            await createItem(values);
        }
        selectedRows.value = [];
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        }, Date.now());

        isDialogOpen.value = false;
        editingCar.value = null;
        resetForm();
    }
    catch (error) {
        console.error('Error submitting car form:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

const onSubmitAndAddNew = async (values: CarForm) => {
    isSubmitting.value = true;
    try {
        if (editingCar.value) {
            await updateItem(editingCar.value.id, values);
            editingCar.value = null;
            dialogMode.value = 'add';
        }
        else {
            await createItem(values);
            dialogMode.value = 'edit';
            await nextTick();
            dialogMode.value = 'add';
        }
        selectedRows.value = [];
        await fetchItems(currentPage.value, perPage.value, {
            search: searchQuery.value,
            sort_by: sortBy.value,
            sort_dir: sortDir.value,
        }, Date.now());
        resetForm();
    }
    catch (error) {
        console.error('Error submitting car form:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingCar.value = null;
};

const handleReset = async () => {
    searchQuery.value = '';
    currentPage.value = 1;
    sortBy.value = 'createdAt';
    sortDir.value = 'desc';
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

async function handleDelete(carId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(carId);
    }
    catch (error) {
        console.error('Error deleting car:', error);
    }
}

async function handleBulkDelete() {
    if (selectedRows.value.length === 0) return;

    const confirmed = await confirmBulkDelete(selectedRows.value.length);
    if (!confirmed) return;

    try {
        await deleteManyItems(selectedRows.value);
        selectedRows.value = [];
    }
    catch (error) {
        console.error('Error deleting cars:', error);
    }
}

const isAllSelected = computed(() => {
    return cars.value.length > 0 && selectedRows.value.length === cars.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = cars.value.map(car => String(car.id));
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
            :page-icon="pageIcon || 'mingcute:car-3-line'"
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

        <PageSearchForm
            v-model:search-query="searchQuery"
            @search-submit="handleSearchSubmit"
            @reset-search="handleReset"
        />

        <div>
            <PageEmptyState
                v-if="cars.length === 0"
                :search-query="searchQuery"
                :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('car.singular')"
            />
            <template v-else>
                <PageTable
                    :header-items="headerItems"
                    :rows="cars.map((car: Car) => ({
                        ...car,
                        selected: selectedRows.includes(String(car.id)),
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
                    <template #cell-model="{ row }">
                        <div class="font-medium">
                            {{ row.model }}
                        </div>
                    </template>

                    <template #cell-plateNumber="{ row }">
                        <Badge variant="secondary">
                            {{ row.plateNumber }}
                        </Badge>
                    </template>

                    <template #cell-type="{ row }">
                        <Badge variant="outline">
                            {{ $t(`car.types.${row.type}`) }}
                        </Badge>
                    </template>

                    <template #cell-automatic="{ row }">
                        <Badge :variant="row.automatic ? 'success' : 'secondary'">
                            {{ row.automatic ? $t('car.automatic_yes') : $t('car.automatic_no') }}
                        </Badge>
                    </template>

                    <template #cell-max="{ row }">
                        <span
                            v-if="row.max !== null"
                            class="font-medium"
                        >
                            {{ row.max }}
                        </span>
                        <span
                            v-else
                            class="text-muted-foreground"
                        >
                            —
                        </span>
                    </template>

                    <template #cell-isActive="{ row }">
                        <Badge :variant="row.isActive ? 'success' : 'secondary'">
                            {{ row.isActive ? $t('car.active_yes') : $t('car.active_no') }}
                        </Badge>
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
                                    class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 size-5! opacity-80 shrink-0 group-hover:text-primary"
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
                                    class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 size-5! opacity-80 shrink-0 group-hover:text-destructive"
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

        <LazyCarFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-car="editingCar"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

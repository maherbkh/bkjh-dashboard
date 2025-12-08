<script setup lang="ts">
import type { Attendee, TableHeaderItem, SortDirection } from '~/types';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const { confirmDelete, confirmBulkDelete } = useConfirmDialog();
const { formatDate } = useGermanDateFormat();
const { sendVerificationEmail, isSendingVerificationEmail } = useAttendeeActions();

// Page configuration
const pageTitle = computed(() => t('attendee.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('attendee.plural'));
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
    items: attendees,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<Attendee, AttendeeForm>({
    crudPath: 'attendees',
    tenant: 'academy',
    formSchema: createAttendeeSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('firstName');
const sortDir = ref<'asc' | 'desc'>('asc');

// Computed properties
const status = computed(() => (isLoading.value ? 'pending' : 'success'));

const headerItems = computed((): TableHeaderItem[] => [
    {
        as: 'th',
        name: t('global.name'),
        id: 'fullName',
        sortable: true,
    },
    {
        as: 'th',
        name: t('attendee.employment_details'),
        id: 'occupation',
        sortable: false,
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'isActive',
        sortable: true,
    },
    {
        as: 'th',
        name: t('academy.plural'),
        id: 'eventsCount',
        sortable: true,
    },
    {
        as: 'th',
        name: t('common.last_login'),
        id: 'lastLoginAt',
        sortable: true,
    },
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
    sortBy.value = 'firstName';
    sortDir.value = 'asc';
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

async function handleSortChange(dir: SortDirection, id: string) {
    sortDir.value = dir;
    sortBy.value = id;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
    selectedRows.value = [];
}

const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await fetchItems(currentPage.value, perPage.value, {
        search: searchQuery.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    });
    selectedRows.value = [];
};

// Form dialog state
const isDialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingAttendee = ref<Attendee | null>(null);
const isSubmitting = ref(false);

// Form handlers
const openAddDialog = () => {
    dialogMode.value = 'add';
    editingAttendee.value = null;
    isDialogOpen.value = true;
};

const openEditDialog = (attendee: Attendee) => {
    dialogMode.value = 'edit';
    editingAttendee.value = attendee;
    isDialogOpen.value = true;
};

const onSubmitAndClose = async (values: AttendeeForm) => {
    isSubmitting.value = true;
    try {
        if (dialogMode.value === 'add') {
            await createItem(values);
        }
        else if (editingAttendee.value) {
            await updateItem(editingAttendee.value.id, values);
        }
        isDialogOpen.value = false;
        selectedRows.value = [];
    }
    catch (error) {
        console.error('Error submitting form:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

const onSubmitAndAddNew = async (values: AttendeeForm) => {
    isSubmitting.value = true;
    try {
        if (editingAttendee.value) {
            // Edit existing attendee
            await updateItem(editingAttendee.value.id, values);
            // After update, switch to add mode
            editingAttendee.value = null;
            dialogMode.value = 'add';
        }
        else {
            // Add new attendee
            await createItem(values);
            // Force form reset by temporarily changing dialogMode to trigger watcher
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
    }
    finally {
        isSubmitting.value = false;
    }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    editingAttendee.value = null;
};

// Delete handlers
async function handleDelete(attendeeId: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
        await deleteItem(attendeeId);
    }
    catch (error) {
        console.error('Error deleting attendee:', error);
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
        console.error('Error deleting attendees:', error);
    }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return (
        attendees.value.length > 0 && selectedRows.value.length === attendees.value.length
    );
});

const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedRows.value = attendees.value.map(attendee => String(attendee.id));
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
                    v-if="attendees.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="
                        $t('action.add') + ' ' + $t('common.new') + ' ' + $t('attendee.singular')
                    "
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems"
                        :rows="attendees.map((attendee: Attendee) => ({
                            ...attendee,
                            selected: selectedRows.includes(attendee.id),
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
                        <template #cell-fullName="{ row }">
                            <div>
                                <div class="font-medium flex items-center gap-2">
                                    {{ row.fullName }}
                                    <Icon
                                        v-if="row.emailVerifiedAt"
                                        :title="$t('attendee.email_verified') + ' ' + $t('common.at') + ' ' + formatDate(row.emailVerifiedAt)"
                                        name="solar:verified-check-bold-duotone"
                                        class="cursor-pointer hover:scale-110 ease-in-out duration-300 !size-4 shrink-0 text-success"
                                    />
                                </div>
                                <div class="text-xs text-muted-foreground mt-0.5">
                                    {{ row.email }}
                                </div>
                            </div>
                        </template>
                        <template #cell-occupation="{ row }">
                            <div v-if="row.isEmployee && row.occupation && row.group">
                                <div>{{ row.group.name }}</div>
                                <div class="text-xs text-muted-foreground mt-0.5">
                                    {{ row.occupation.name }}
                                </div>
                            </div>
                            <div
                                v-else
                                class="text-muted-foreground text-sm italic"
                            >
                                {{ $t("attendee.no_employment_details") }}
                            </div>
                        </template>

                        <template #cell-isEmployee="{ row }">
                            <Badge :variant="row.isEmployee ? 'default' : 'secondary'">
                                {{
                                    row.isEmployee ? $t("attendee.employee") : $t("attendee.non_employee")
                                }}
                            </Badge>
                        </template>

                        <template #cell-isActive="{ row }">
                            <Badge :variant="row.isActive ? 'default' : 'secondary'">
                                {{ row.isActive ? $t("common.active") : $t("common.inactive") }}
                            </Badge>
                        </template>

                        <template #cell-eventsCount="{ row }">
                            <Badge variant="outline">
                                {{ row.eventsCount || 0 }} {{ $t("academy.plural") }}
                            </Badge>
                        </template>

                        <template #cell-lastLoginAt="{ row }">
                            <div class="text-sm">
                                {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : $t("common.never") }}
                            </div>
                        </template>

                        <template #cell-createdAt="{ row }">
                            {{ formatDate(row.createdAt) }}
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <LazyButton
                                    v-if="!row.emailVerifiedAt"
                                    :title="$t('attendee.resend_verification_email')"
                                    variant="ghost"
                                    size="icon"
                                    :disabled="isSendingVerificationEmail"
                                    hydrate-on-interaction="mouseover"
                                    @click="sendVerificationEmail(row.id, () => fetchItems(currentPage, perPage, { sort_by: sortBy, sort_dir: sortDir, search: searchQuery }))"
                                >
                                    <Icon
                                        v-if="isSendingVerificationEmail"
                                        name="solar:refresh-linear"
                                        class="!size-5 animate-spin"
                                    />
                                    <Icon
                                        v-else
                                        name="solar:letter-unread-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                                <LazyButton
                                    :title="$t('action.edit')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                    @click="openEditDialog(row)"
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
                                    hydrate-on-interaction="mouseover"
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

        <LazyAttendeeFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-attendee="editingAttendee"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

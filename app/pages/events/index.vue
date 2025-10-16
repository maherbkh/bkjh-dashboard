<script setup lang="ts">
import type { EventData, TableHeaderItem } from '~/types';

const { t } = useI18n();
const router = useRouter();
const { formatDateShort } = useGermanDateFormat();

// Page configuration
const pageTitle = computed(() => t('academy.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('academy.description'));

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
    items: events,
    loading: isLoading,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteManyItems,
    resetForm,
    setValues,
} = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

const selectedRows = ref<string[]>([]);

// Search and pagination state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

const headerItems = computed((): TableHeaderItem[] => [
    { as: 'th', name: t('event.title'), id: 'title' },
    { as: 'th', name: t('event.type'), id: 'type' },
    { as: 'th', name: t('academy.information'), id: 'eventCategory' },
    { as: 'th', name: t('event.max_capacity'), id: 'maxCapacity' },
    { as: 'th', name: t('common.status'), id: 'isActive' },
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

// Navigation handlers
const handleEdit = (event: EventData) => {
    navigateTo(`/events/${event.id}/edit`);
};

const { confirmDelete, confirmBulkDelete } = useConfirmDialog();

async function handleDelete(id: string) {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try {
        await deleteItem(id);
    }
    catch (error) {
        console.error('Error deleting event:', error);
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
    catch (error) { console.error('Error deleting events:', error); }
}

// Row selection handlers
const isAllSelected = computed(() => {
    return events.value.length > 0 && selectedRows.value.length === events.value.length;
});

const handleSelectAll = (checked: boolean) => {
    if (checked) selectedRows.value = events.value.map(ev => String(ev.id));
    else selectedRows.value = [];
};

const handleRowSelected = (id: string, checked: boolean) => {
    if (checked) selectedRows.value.push(id);
    else selectedRows.value = selectedRows.value.filter(rowId => rowId !== id);
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :has-add-new="false"
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:calendar-outline'"
        >
            <template #actions>
                <NuxtLink to="/events/add">
                    <Button
                        variant="default"
                        size="sm"
                    >
                        <Icon
                            name="solar:clipboard-add-outline"
                            class="!size-4 shrink-0"
                        />
                        {{ $t('action.add') }} {{ $t('common.new') }} {{ $t('academy.singular') }}
                    </Button>
                </NuxtLink>
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
                    v-if="events.length === 0"
                    :search-query="searchQuery"
                    :add-new-text="$t('action.add') + ' ' + $t('common.new') + ' ' + $t('academy.singular')"
                />
                <template v-else>
                    <PageTable
                        :header-items="headerItems"
                        :rows="events.map((ev: EventData) => ({ ...ev, selected: selectedRows.includes(String(ev.id)) }))"
                        :selected-rows="selectedRows"
                        :loading="isLoading"
                        :skeleton-rows="perPage"
                        :selectable="true"
                        :params="{ page: currentPage, length: perPage, sortBy, sortDir, search: searchQuery }"
                        :model-value="isAllSelected"
                        @toggle-sort="handleSortChange"
                        @row-selected="(id: number | string, checked: boolean) => handleRowSelected(String(id), checked)"
                        @update:selected-rows="(rows: (string | number)[]) => selectedRows = rows.map(String)"
                        @update:model-value="handleSelectAll"
                    >
                        <template #cell-title="{ row }">
                            <div class="font-medium ">
                                <NuxtLink
                                    :to="`/events/${row.id}/show`"
                                    class="hover:underline hover:text-primary truncate"
                                >
                                    {{ row.title }}
                                </NuxtLink>
                                <div
                                    v-if="row.schedules && row.schedules.length > 0"
                                    class="mt-1 text-muted-foreground flex items-center gap-1 whitespace-nowrap text-xs"
                                >
                                    <div>
                                        {{ formatDateShort(row.schedules[0]?.date) }}
                                    </div>
                                    <template v-if="row.schedules.length > 1">
                                        <Icon
                                            name="solar:arrow-right-bold-duotone"
                                            class="size-5 shrink-0 opacity-75"
                                        />
                                        <div>
                                            {{ formatDateShort(row.schedules[(row.schedules.length - 1)]?.date) }}
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>

                        <template #cell-type="{ row }">
                            <Badge variant="outline">
                                {{ (row.type || '').toString() }}
                            </Badge>
                        </template>

                        <template #cell-eventCategory="{ row }">
                            <div class-font-m="normal truncat">
                                <span v-if="row.eventCategory">{{ row.eventCategory.name }}</span>
                                <span
                                    v-else
                                    class="text-muted-foreground"
                                >{{ $t('common.not_assigned') }}</span>
                            </div>
                            <div class-font-m="normal truncat">
                                <span
                                    v-if="row.eventTarget"
                                    class="text-muted-foreground"
                                >{{ row.eventTarget.name }}</span>
                                <span
                                    v-else
                                    class="text-muted-foreground"
                                >{{ $t('common.not_assigned') }}</span>
                            </div>
                        </template>

                        <template #cell-maxCapacity="{ row }">
                            <div class="flex flex-col gap-1">
                                <div>
                                    <Button
                                        variant="secondary"
                                        size="icon-sm"
                                        class="!cursor-default font-normal border !border-border aspect-square !size-5 text-xs"
                                    >
                                        {{ row.maxCapacity || 0 }}
                                    </Button>
                                    <span class="text-muted-foreground ml-1.5 text-xs font-normal">Attenden</span>
                                </div>
                                <div>
                                    <Button
                                        variant="secondary"
                                        size="icon-sm"
                                        class="!cursor-default font-normal border !border-border aspect-square !size-5 text-xs"
                                    >
                                        {{ row.approvedRegistrationsCount || 0 }}
                                    </Button>
                                    <span class="text-muted-foreground ml-1.5 text-xs font-normal">Aprroved</span>
                                </div>
                            </div>
                        </template>

                        <template #cell-isActive="{ row }">
                            <div>
                                <Badge
                                    :variant="row.isActive ? 'default' : 'secondary'"
                                    class="w-full"
                                >
                                    {{ row.isActive ? $t('common.active') : $t('common.inactive') }}
                                </Badge>
                            </div>
                        </template>

                        <template #cell-actions="{ row }">
                            <div class="flex justify-end gap-2">
                                <NuxtLink :to="`/events/${row.id}/show`">
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
                                <LazyButton
                                    :title="$t('action.duplicate')"
                                    variant="default"
                                    size="icon"
                                    @click="handleDelete(row.id)"
                                >
                                    <Icon
                                        name="solar:copy-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-destructive"
                                    />
                                </LazyButton>

                                <LazyButton
                                    :title="$t('action.abgesagt')"
                                    variant="destructive"
                                    size="icon"
                                    @click="handleDelete(row.id)"
                                >
                                    <Icon
                                        name="solar:close-circle-outline"
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
    </div>
</template>

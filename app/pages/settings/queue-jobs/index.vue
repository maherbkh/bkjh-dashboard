<script setup lang="ts">
import type { QueueJob, QueueJobStatus, QueueName, TableHeaderItem, ServerParamsTypes } from '~/types';
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const router = useRouter();
const { formatDateShort } = useGermanDateFormat();

// Check superAdmin permission
const userStore = useUserStore();
await userStore.fetchAuthUser();
if (!userStore.user?.isSuperAdmin) {
    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'You do not have permission to access this page',
    });
}

// Page configuration
const pageTitle = computed(() => t('queue_job.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('queue_job.plural'));
definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// CRUD operations - read-only, no form schema needed
const {
    items: queueJobs,
    loading: isLoading,
    pagination,
    fetchItems,
} = useCrud<QueueJob, never>({
    crudPath: 'queue-jobs',
    tenant: 'shared',
});

// Filter and search state
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(25);
const sortBy = ref('queuedAt');
const sortDir = ref<'asc' | 'desc'>('desc');
const selectedQueueName = ref<QueueName | ''>('');
const selectedStatus = ref<QueueJobStatus | ''>('');
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

// Queue name options
const queueNameOptions = computed(() => [
    { value: '', label: t('queue_job.all_queues') },
    { value: 'email', label: t('queue_job.queues.email') },
    { value: 'certificate-generation', label: t('queue_job.queues.certificate-generation') },
    { value: 'certificate-email', label: t('queue_job.queues.certificate-email') },
    { value: 'sla-deadlines', label: t('queue_job.queues.sla-deadlines') },
]);

// Status options
const statusOptions = computed(() => [
    { value: '', label: t('queue_job.all_statuses') },
    { value: 'QUEUED', label: t('queue_job.status.queued') },
    { value: 'PROCESSING', label: t('queue_job.status.processing') },
    { value: 'COMPLETED', label: t('queue_job.status.completed') },
    { value: 'FAILED', label: t('queue_job.status.failed') },
    { value: 'RETRYING', label: t('queue_job.status.retrying') },
]);

// Table headers
const headerItems = computed(() => [
    {
        as: 'th',
        name: t('queue_job.job_id'),
        id: 'jobId',
    },
    {
        as: 'th',
        name: t('queue_job.queue_name'),
        id: 'queueName',
    },
    {
        as: 'th',
        name: t('queue_job.job_type'),
        id: 'jobType',
    },
    {
        as: 'th',
        name: t('queue_job.status.label'),
        id: 'status',
        sortable: false,
    },
    {
        as: 'th',
        name: t('queue_job.recipient'),
        id: 'recipient',
        sortable: false,
    },
    {
        as: 'th',
        name: t('queue_job.attempts'),
        id: 'attempts',
        sortable: false,
    },
    {
        as: 'th',
        name: t('queue_job.queued_at'),
        id: 'queuedAt',
    },
]);

// Build query parameters
const buildQueryParams = () => {
    const params: Record<string, any> = {
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
    };

    if (searchQuery.value) {
        params.search = searchQuery.value;
    }

    if (selectedQueueName.value) {
        params.queue_name = selectedQueueName.value;
    }

    if (selectedStatus.value) {
        params.status = selectedStatus.value;
    }

    if (startDate.value) {
        params.start_date = startDate.value;
    }

    if (endDate.value) {
        params.end_date = endDate.value;
    }

    return params;
};

// Fetch items with current filters
const loadItems = async () => {
    const params = buildQueryParams();
    await fetchItems(currentPage.value, perPage.value, params);
};

// Initialize data
await loadItems();

// Search and filter handlers
const handleSearchSubmit = async () => {
    currentPage.value = 1;
    await loadItems();
};

const handleReset = async () => {
    searchQuery.value = '';
    selectedQueueName.value = '';
    selectedStatus.value = '';
    startDate.value = null;
    endDate.value = null;
    currentPage.value = 1;
    sortBy.value = 'queuedAt';
    sortDir.value = 'desc';
    await loadItems();
};

const handlePageChange = async (page: number) => {
    currentPage.value = page;
    await loadItems();
};

const handleSortChange = async (dir: 'asc' | 'desc', id: string) => {
    sortDir.value = dir;
    sortBy.value = id;
    currentPage.value = 1;
    await loadItems();
};

// Watch filter changes and reload
watch([selectedQueueName, selectedStatus, startDate, endDate], () => {
    currentPage.value = 1;
    loadItems();
});

// Status badge variant helper - matching attendee registration status colors
const getStatusVariant = (status: QueueJobStatus) => {
    switch (status) {
        case 'QUEUED':
            return 'pending';
        case 'PROCESSING':
            return 'default';
        case 'COMPLETED':
            return 'success';
        case 'FAILED':
            return 'destructive';
        case 'RETRYING':
            return 'pending';
        default:
            return 'default';
    }
};

// Queue name badge variant helper
const getQueueVariant = (queueName: QueueName) => {
    switch (queueName) {
        case 'email':
            return 'default';
        case 'certificate-generation':
            return 'secondary';
        case 'certificate-email':
            return 'secondary';
        case 'sla-deadlines':
            return 'outline';
        default:
            return 'outline';
    }
};

// Navigate to show page
const handleView = (job: QueueJob) => {
    router.push(`/settings/queue-jobs/${job.id}`);
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:list-check-outline'"
        />
        
        <!-- Filters and Search -->
        <div class="border-b p-4 space-y-4">
            <form
                class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end"
                @submit.prevent="handleSearchSubmit"
                @reset.prevent="handleReset"
            >
                <!-- Search -->
                <FormItemInput
                    v-model="searchQuery"
                    :placeholder="$t('action.search_placeholder')"
                    icon="solar:rounded-magnifer-linear"
                    class="col-span-12 lg:col-span-3"
                />
                
                <!-- Queue Name Filter -->
                <FormItemSelect
                    v-model="selectedQueueName"
                    :title="$t('queue_job.filter_by_queue')"
                    :placeholder="$t('queue_job.filter_by_queue')"
                    :data="queueNameOptions"
                    key-value="value"
                    name-value="label"
                    class="col-span-12 lg:col-span-2"
                />
                
                <!-- Status Filter -->
                <FormItemSelect
                    v-model="selectedStatus"
                    :title="$t('queue_job.filter_by_status')"
                    :placeholder="$t('queue_job.filter_by_status')"
                    :data="statusOptions"
                    key-value="value"
                    name-value="label"
                    class="col-span-12 lg:col-span-2"
                />
                
                <!-- Start Date -->
                <FormItemDatePicker
                    v-model="startDate"
                    :title="$t('queue_job.date_range')"
                    :placeholder="$t('queue_job.date_range')"
                    format="yyyy-MM-dd"
                    :time-picker="false"
                    class="col-span-12 lg:col-span-2"
                />
                
                <!-- End Date -->
                <FormItemDatePicker
                    v-model="endDate"
                    :placeholder="$t('queue_job.date_range')"
                    format="yyyy-MM-dd"
                    :time-picker="false"
                    class="col-span-12 lg:col-span-2"
                />
                
                <!-- Search Button -->
                <Button
                    type="submit"
                    class="cursor-pointer col-span-6 lg:col-span-1"
                    size="sm"
                    variant="secondary"
                >
                    <Icon
                        class="shrink-0 w-full"
                        name="solar:rounded-magnifer-linear"
                    />
                </Button>
                
                <!-- Reset Button -->
                <Button
                    type="reset"
                    class="cursor-pointer col-span-6 lg:col-span-1"
                    variant="outline"
                    size="sm"
                >
                    <Icon
                        class="shrink-0 w-full"
                        name="solar:restart-line-duotone"
                    />
                </Button>
            </form>
        </div>
        
        <!-- Table -->
        <div>
            <PageEmptyState
                v-if="queueJobs.length === 0 && !isLoading"
                :search-query="searchQuery"
            />
            <template v-else>
                <PageTable
                    :header-items="headerItems as TableHeaderItem[]"
                    :rows="queueJobs.map(job => ({
                        ...job,
                    }))"
                    :loading="isLoading"
                    :skeleton-rows="perPage"
                    :selectable="false"
                    :selected-rows="[]"
                    :params="{
                        page: currentPage,
                        length: perPage,
                        sortBy: sortBy,
                        sortDir: sortDir,
                        search: searchQuery,
                    } as ServerParamsTypes"
                    @toggle-sort="handleSortChange"
                >
                    <template #cell-jobId="{ row }">
                        <div class="font-mono text-sm">
                            <span
                                :title="row.jobId"
                                class="truncate max-w-[200px] inline-block"
                            >
                                {{ row.jobId }}
                            </span>
                        </div>
                    </template>
                    
                    <template #cell-queueName="{ row }">
                        <Badge
                            :variant="getQueueVariant(row.queueName)"
                            class="text-xs"
                        >
                            {{ $t(`queue_job.queues.${row.queueName}`) }}
                        </Badge>
                    </template>
                    
                    <template #cell-jobType="{ row }">
                        <div class="text-sm">
                            {{ row.jobType }}
                        </div>
                    </template>
                    
                    <template #cell-status="{ row }">
                        <Badge
                            :variant="getStatusVariant(row.status)"
                            class="text-xs"
                        >
                            {{ $t(`queue_job.status.${row.status.toLowerCase()}`) || row.status }}
                        </Badge>
                    </template>
                    
                    <template #cell-recipient="{ row }">
                        <div class="text-sm">
                            {{ row.recipient || $t('queue_job.not_available') }}
                        </div>
                    </template>
                    
                    <template #cell-attempts="{ row }">
                        <div class="text-sm">
                            {{ row.attempts }}/{{ row.maxAttempts }}
                        </div>
                    </template>
                    
                    <template #cell-queuedAt="{ row }">
                        <div class="text-sm">
                            {{ row.queuedAt ? formatDateShort(row.queuedAt) : $t('queue_job.not_available') }}
                        </div>
                    </template>
                    
                    <template #cell-actions="{ row }">
                        <div class="flex justify-end gap-2">
                            <LazyButton
                                :title="$t('action.view')"
                                variant="ghost"
                                size="icon"
                                hydrate-on-interaction="mouseover"
                                @click="handleView(row)"
                            >
                                <Icon
                                    name="solar:eye-outline"
                                    class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
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
</template>

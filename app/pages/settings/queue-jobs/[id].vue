<script setup lang="ts">
import type { QueueJob, QueueJobResponse, QueueJobRetryResponse, QueueJobStatus, QueueName } from '~/types';
import { useUserStore } from '~/stores/user';
import { toast } from 'vue-sonner';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { formatDate } = useGermanDateFormat();

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

// Get ID from route params
const id = computed(() => route.params.id as string);

// Page configuration
const pageTitle = computed(() => t('queue_job.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('queue_job.singular'));
definePageMeta({
    middleware: 'auth',
});

// Fetch queue job
const { data: jobData, pending: isLoading, error, refresh } = useApiFetch<QueueJobResponse>(
    `/shared/queue-jobs/${id.value}`,
    {
        immediate: false,
    },
);

const job = computed(() => jobData.value?.data as QueueJob | undefined);

// Check if job is not found
const isJobNotFound = computed(() => {
    return !isLoading.value && (error.value || !job.value);
});

// Load job on mount
onMounted(async () => {
    await refresh();
});

// Set page meta
useSeoMeta({
    title: computed(() => `${job.value?.jobId || id.value} - ${pageTitle.value}`),
    ogTitle: computed(() => `${job.value?.jobId || id.value} - ${pageTitle.value}`),
    description: pageDescription,
    ogDescription: pageDescription,
});

// Retry functionality
const isRetrying = ref(false);
const { show: showAlertDialog } = useAlertDialog();

// Check if job is retryable
const isRetryable = computed(() => {
    if (!job.value) return false;
    if (job.value.status !== 'FAILED') return false;
    
    // Check if queue is retryable
    const retryableQueues: QueueName[] = ['email', 'certificate-generation', 'certificate-email'];
    return retryableQueues.includes(job.value.queueName);
});

const handleRetry = async () => {
    if (!job.value || !isRetryable.value) return;

    const confirmed = await showAlertDialog({
        title: t('queue_job.retry_confirm_title'),
        description: t('queue_job.retry_confirm_description'),
        confirmText: t('queue_job.retry'),
        cancelText: t('action.cancel'),
    });

    if (!confirmed) return;

    isRetrying.value = true;
    try {
        const { data, error: retryError } = await useApiFetch<QueueJobRetryResponse>(
            `/shared/queue-jobs/${id.value}/retry`,
            {
                method: 'POST',
            },
        );

        if (retryError.value) {
            const errorMessage = (retryError.value as any).data?.message || retryError.value.message || t('queue_job.retry_failed');
            toast.error(errorMessage);
            return;
        }

        if (data.value?.success) {
            toast.success(t('queue_job.retry_success'));
            // Refresh job data
            await refresh();
        } else {
            toast.error(t('queue_job.retry_failed'));
        }
    } catch (err) {
        console.error('Error retrying job:', err);
        toast.error(t('queue_job.retry_failed'));
    } finally {
        isRetrying.value = false;
    }
};

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

// Format processing time
const formatProcessingTime = (ms: number | null): string => {
    if (!ms) return t('queue_job.not_available');
    if (ms < 1000) return `${ms} ${t('queue_job.ms')}`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

// Format payload as JSON
const formattedPayload = computed(() => {
    if (!job.value?.payload) return '';
    return JSON.stringify(job.value.payload, null, 2);
});
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <LazyButton
                    variant="ghost"
                    size="icon"
                    @click="router.push('/settings/queue-jobs')"
                >
                    <Icon
                        name="solar:arrow-left-outline"
                        class="!size-5"
                    />
                </LazyButton>
                <div>
                    <h1 class="text-2xl font-semibold">
                        {{ job?.jobId || id }}
                    </h1>
                    <p class="text-sm text-muted-foreground">
                        {{ t('queue_job.singular') }}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <Badge
                    v-if="job"
                    :variant="getStatusVariant(job.status)"
                    class="text-xs"
                >
                    {{ $t(`queue_job.status.${job.status.toLowerCase()}`) || job.status }}
                </Badge>
                <LazyButton
                    v-if="isRetryable"
                    variant="destructive"
                    size="sm"
                    :disabled="isRetrying"
                    @click="handleRetry"
                >
                    <Icon
                        v-if="isRetrying"
                        name="solar:refresh-outline"
                        class="!size-4 animate-spin"
                    />
                    <Icon
                        v-else
                        name="solar:refresh-outline"
                        class="!size-4"
                    />
                    {{ t('queue_job.retry') }}
                </LazyButton>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="isLoading"
            class="flex items-center justify-center py-12"
        >
            <div class="text-center">
                <Icon
                    name="solar:refresh-outline"
                    class="!size-8 animate-spin mx-auto mb-2 text-muted-foreground"
                />
                <p class="text-sm text-muted-foreground">
                    {{ t('global.loading') }}
                </p>
            </div>
        </div>

        <!-- Not Found State -->
        <div
            v-else-if="isJobNotFound"
            class="flex items-center justify-center py-12"
        >
            <div class="text-center">
                <Icon
                    name="solar:file-remove-outline"
                    class="!size-12 mx-auto mb-4 text-muted-foreground"
                />
                <h2 class="text-xl font-semibold mb-2">
                    {{ t('action.message.not_found_title', { model: t('queue_job.singular') }) }}
                </h2>
                <p class="text-sm text-muted-foreground mb-4">
                    {{ t('action.message.not_found_description', { model: t('queue_job.singular') }) }}
                </p>
                <Button
                    variant="outline"
                    @click="router.push('/settings/queue-jobs')"
                >
                    {{ t('action.back') }}
                </Button>
            </div>
        </div>

        <!-- Job Details -->
        <div
            v-else-if="job"
            class="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            <!-- Basic Information Card -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Icon
                            name="solar:info-circle-outline"
                            class="!size-5 opacity-75 shrink-0"
                        />
                        {{ t('queue_job.basic_info') }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col divide-y divide-dashed">
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('common.id') }}
                        </span>
                        <span class="text-sm font-mono">
                            {{ job.id }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.job_id') }}
                        </span>
                        <span class="text-sm font-mono">
                            {{ job.jobId }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.queue_name') }}
                        </span>
                        <Badge
                            :variant="getQueueVariant(job.queueName)"
                            class="text-xs"
                        >
                            {{ $t(`queue_job.queues.${job.queueName}`) }}
                        </Badge>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.job_type') }}
                        </span>
                        <span class="text-sm">
                            {{ job.jobType }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.status.label') }}
                        </span>
                        <Badge
                            :variant="getStatusVariant(job.status)"
                            class="text-xs"
                        >
                            {{ $t(`queue_job.status.${job.status.toLowerCase()}`) || job.status }}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <!-- Timing Information Card -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Icon
                            name="solar:clock-circle-outline"
                            class="!size-5 opacity-75 shrink-0"
                        />
                        {{ t('queue_job.timing') }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="flex flex-col divide-y divide-dashed">
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.queued_at') }}
                        </span>
                        <span class="text-sm">
                            {{ job.queuedAt ? formatDate(job.queuedAt) : t('queue_job.not_available') }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.started_at') }}
                        </span>
                        <span class="text-sm">
                            {{ job.startedAt ? formatDate(job.startedAt) : t('queue_job.not_available') }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.completed_at') }}
                        </span>
                        <span class="text-sm">
                            {{ job.completedAt ? formatDate(job.completedAt) : t('queue_job.not_available') }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.failed_at') }}
                        </span>
                        <span class="text-sm">
                            {{ job.failedAt ? formatDate(job.failedAt) : t('queue_job.not_available') }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.processing_time') }}
                        </span>
                        <span class="text-sm">
                            {{ formatProcessingTime(job.processingTime) }}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <!-- Attempts Information Card -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Icon
                            name="solar:refresh-outline"
                            class="!size-5 opacity-75 shrink-0"
                        />
                        {{ t('queue_job.attempts_info') }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.attempts') }}
                        </span>
                        <span class="text-sm font-semibold">
                            {{ job.attempts }} / {{ job.maxAttempts }}
                        </span>
                    </div>
                    <div class="w-full">
                        <div class="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{{ t('queue_job.attempts') }}</span>
                            <span>{{ job.attempts }} / {{ job.maxAttempts }}</span>
                        </div>
                        <div class="w-full bg-secondary rounded-full h-2">
                            <div
                                class="bg-primary h-2 rounded-full transition-all"
                                :style="{ width: `${(job.attempts / job.maxAttempts) * 100}%` }"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Payload Card -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Icon
                            name="solar:document-text-outline"
                            class="!size-5 opacity-75 shrink-0"
                        />
                        {{ t('queue_job.payload') }}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="bg-muted rounded-lg p-4 max-h-[400px] overflow-auto">
                        <pre class="text-xs font-mono whitespace-pre-wrap break-words">{{ formattedPayload || t('queue_job.not_available') }}</pre>
                    </div>
                </CardContent>
            </Card>

            <!-- Error Information Card (only if failed) -->
            <Card
                v-if="job.status === 'FAILED' || job.errorMessage"
                class="lg:col-span-2"
            >
                <CardHeader>
                    <CardTitle class="flex items-center gap-2 text-destructive">
                        <Icon
                            name="solar:danger-triangle-outline"
                            class="!size-5 opacity-75 shrink-0"
                        />
                        {{ t('queue_job.error_info') }}
                    </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div
                        v-if="job.errorMessage"
                        class="space-y-2"
                    >
                        <div class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.error_message') }}
                        </div>
                        <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p class="text-sm text-destructive">
                                {{ job.errorMessage }}
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="job.errorStack"
                        class="space-y-2"
                    >
                        <div class="text-sm font-medium text-muted-foreground">
                            {{ t('queue_job.error_stack') }}
                        </div>
                        <div class="bg-muted rounded-lg p-4 max-h-[300px] overflow-auto">
                            <pre class="text-xs font-mono whitespace-pre-wrap break-words text-destructive">{{ job.errorStack }}</pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

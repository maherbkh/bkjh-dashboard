<script setup lang="ts">
import type {
    SupportTicket,
    TicketStatus,
    TableHeaderItem,
} from '~/types';

const { t } = useI18n();
const router = useRouter();
const { formatDate } = useGermanDateFormat();

// Page configuration
const pageTitle = computed(() => t('task.plural'));
const pageIcon = 'solar:clipboard-list-outline';
const pageDescription = computed(() => t('task.plural'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// Fetch tasks data
const { data: tasksData, pending: isLoading, refresh } = await useApiFetch<{
    success: boolean;
    data: SupportTicket[];
}>('/auth/profile/tasks');

const tasks = computed(() => tasksData.value?.data || []);

// Table headers
const headerItems = computed(() => [
    {
        as: 'th',
        name: t('common.number'),
        id: 'ticketNumber',
    },
    {
        as: 'th',
        name: t('requester.name'),
        id: 'requester',
    },
    {
        as: 'th',
        name: t('common.status'),
        id: 'status',
    },
    {
        as: 'th',
        name: t('category.singular'),
        id: 'category',
    },
    {
        as: 'th',
        name: t('group.singular'),
        id: 'group',
    },
    {
        as: 'th',
        name: t('common.created_at'),
        id: 'createdAt',
    },
]);

// Helper function to get latest status
const getLatestStatus = (statuses: TicketStatus[]) => {
    if (!statuses || statuses.length === 0) return null;
    return statuses.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'secondary';
        case 'IN_PROGRESS':
            return 'default';
        case 'RESOLVED':
            return 'success';
        case 'CLOSED':
            return 'outline';
        case 'CANCELLED':
            return 'destructive';
        default:
            return 'secondary';
    }
};
</script>

<template>
    <div class="flex flex-col gap-4">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon"
        >
            <Button
                variant="outline"
                size="sm"
                @click="router.back()"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
        </PageHeader>

        <div>
            <!-- Loading State -->
            <div
                v-if="isLoading"
                class="flex items-center justify-center py-12"
            >
                <Icon
                    name="solar:refresh-linear"
                    class="!size-8 shrink-0 animate-spin"
                />
                <span class="ml-2">{{ $t("global.loading") }}</span>
            </div>

            <!-- Empty State -->
            <PageEmptyState
                v-else-if="tasks.length === 0"
                :show-add-button="false"
            />

            <!-- Tasks Table -->
            <template v-else>
                <PageTable
                    :header-items="headerItems as TableHeaderItem[]"
                    :rows="tasks"
                    :selected-rows="[]"
                    :loading="isLoading"
                    :selectable="false"
                    :sortable="false"
                >
                    <template #cell-ticketNumber="{ row }">
                        <div class="font-medium">
                            <NuxtLink
                                :to="`/support-tickets/${row.id}`"
                                class="hover:text-primary hover:underline"
                            >
                                {{ row.ticketNumber }}
                            </NuxtLink>
                        </div>
                    </template>

                    <template #cell-requester="{ row }">
                        <div class="font-medium">
                            {{ row.requester.name }}
                            <Icon
                                v-if="row.attachments && row.attachments.length > 0"
                                title="Has Attachments"
                                name="solar:folder-favourite-bookmark-bold-duotone"
                                class="!size-4 text-success shrink-0 ml-1.5"
                            />
                        </div>
                        <div class="text-muted-foreground text-sm">
                            {{ row.requester.email }}
                        </div>
                    </template>

                    <template #cell-status="{ row }">
                        <Badge
                            v-if="row.statuses"
                            :variant="
                                getStatusVariant(getLatestStatus(row.statuses)?.status || 'PENDING')
                            "
                        >
                            {{
                                $t(
                                    `common.${getLatestStatus(
                                        row.statuses,
                                    )?.status?.toLowerCase()}`,
                                )
                            }}
                        </Badge>
                    </template>

                    <template #cell-category="{ row }">
                        <span v-if="row.ticketCategory">
                            {{ row.ticketCategory.name }}
                        </span>
                        <span
                            v-else
                            class="text-muted-foreground"
                        >
                            {{ $t("common.not_assigned") }}
                        </span>
                    </template>

                    <template #cell-group="{ row }">
                        <span v-if="row.group">
                            {{ row.group.name }}
                        </span>
                        <span
                            v-else
                            class="text-muted-foreground"
                        >
                            {{ $t("common.not_assigned") }}
                        </span>
                    </template>

                    <template #cell-createdAt="{ row }">
                        {{ formatDate(row.createdAt) }}
                    </template>

                    <template #cell-actions="{ row }">
                        <div class="flex justify-end">
                            <NuxtLink :to="`/support-tickets/${row.id}`">
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
                        </div>
                    </template>
                </PageTable>
            </template>
        </div>
    </div>
</template>

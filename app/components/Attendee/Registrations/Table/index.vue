<script setup lang="ts">
import type { AttendeeRegistration } from '~/types';

const { t } = useI18n();
const { formatDateParts } = useGermanDateFormat();

const props = defineProps<{
    data: AttendeeRegistration[];
}>();

const headerItems = computed(() => [
    { as: 'th' as const, name: t('academy.singular'), id: 'event' },
    { as: 'th' as const, name: t('attendee.registration_date'), id: 'date' },
    { as: 'th' as const, name: t('attendee.registration_status'), id: 'status' },
    { as: 'th' as const, name: t('common.actions'), id: 'actions' },
]);

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'APPROVED':
            return 'success';
        case 'PENDING':
            return 'pending';
        case 'REJECTED':
            return 'destructive';
        default:
            return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING':
            return t('academy.pending');
        case 'APPROVED':
            return t('event.approved');
        case 'REJECTED':
            return t('event.rejected');
        default:
            return status;
    }
};
</script>

<template>
    <PageEmptyState
        v-if="!data || data.length === 0"
        :search-query="''"
        :add-new-text="t('attendee.registrations')"
        :no-add-new-text="true"
    />
    <PageTable
        v-else
        :header-items="headerItems"
        :rows="data"
        :selected-rows="[]"
        :loading="false"
        :skeleton-rows="3"
        :selectable="false"
        :sortable="false"
        :has-actions-slot="false"
    >
        <template #cell-event="{ row }">
            <div class="flex items-center gap-2">
                <div class="font-normal line-clamp-1 leading-normal">
                    {{ row.event?.title }}
                </div>
            </div>
        </template>

        <template #cell-date="{ row }">
            <div class="flex flex-col text-xs">
                <div class="text-sm font-normal flex items-center gap-1.5">
                    <div class="flex items-center gap-1.5">
                        <Icon
                            name="solar:calendar-mark-line-duotone"
                            class="opacity-50 size-4!"
                        />
                        {{ formatDateParts(row.registeredAt).date }}
                    </div>
                    <Icon
                        name="solar:arrow-right-bold-duotone"
                        class="size-5 mt-0.5 shrink-0 opacity-50"
                    />
                    <div class="flex items-center gap-1.5">
                        <Icon
                            name="solar:watch-square-line-duotone"
                            class="opacity-50 size-4!"
                        />
                        {{ formatDateParts(row.registeredAt).time }}
                    </div>
                </div>
            </div>
        </template>

        <template #cell-status="{ row }">
            <Badge
                :variant="getStatusVariant(row.registrationStatus)"
                class="w-fit"
            >
                {{ getStatusLabel(row.registrationStatus) }}
            </Badge>
        </template>

        <template #cell-actions="{ row }">
            <div class="flex justify-end gap-2">
                <NuxtLink
                    v-if="row.event?.id"
                    :to="`/events/${row.event.id}/show`"
                >
                    <LazyButton
                        :title="$t('action.view')"
                        variant="ghost"
                        size="icon"
                        hydrate-on-interaction="mouseover"
                    >
                        <Icon
                            name="solar:eye-outline"
                            class="size-5! shrink-0 opacity-80 transition duration-200 ease-in-out group-hover:scale-110 group-hover:text-primary group-hover:opacity-100"
                        />
                    </LazyButton>
                </NuxtLink>
            </div>
        </template>
    </PageTable>
</template>

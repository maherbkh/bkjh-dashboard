<script setup lang="ts">
import type { AttendeeEvent } from '~/types';

const { t } = useI18n();
const { formatDateParts } = useGermanDateFormat();

const props = defineProps<{
    data: AttendeeEvent[];
}>();

const headerItems = computed(() => [
    { as: 'th', name: t('academy.singular'), id: 'event' },
    { as: 'th', name: t('attendee.registration_status'), id: 'status' },
    { as: 'th', name: t('attendee.registration_date'), id: 'date' },
    { as: 'th', name: t('common.actions'), id: 'actions' },
]);

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
            return 'success';
        case 'PENDING':
            return 'pending';
        case 'ATTENDED':
            return 'default';
        case 'REJECTED':
            return 'destructive';
        default:
            return 'default';
    }
};
</script>

<template>
    <PageTable
        :header-items="headerItems"
        :rows="data"
        :selected-rows="[]"
        :loading="false"
        :skeleton-rows="3"
        :selectable="false"
        :sortable="false"
    >
        <template #cell-event="{ row }">
            <div class="flex flex-col">
                <div class="flex items-center gap-2">
                    <div class="font-medium">
                        {{ row.title }}
                    </div>
                    <Icon
                        :title="row.isActive ? 'Event is Active' : 'Event is not active'"
                        :name="row.isActive ? 'solar:check-circle-bold' : 'solar:close-circle-bold'"
                        :class="[(row.isActive ? 'text-success' : 'text-muted-foreground'), 'shrink-0 size-4']"
                    />
                </div>
            </div>
        </template>

        <template #cell-status="{ row }">
            <Badge
                :variant="getStatusVariant(row.registrationStatus)"
                class="w-fit"
            >
                {{ row.registrationStatus }}
            </Badge>
        </template>

        <template #cell-date="{ row }">
            <div class="flex flex-col">
                <div class="text-sm font-medium flex items-start gap-1.5">
                    <div class="flex items-start gap-1.5">
                        <Icon
                            name="solar:calendar-mark-line-duotone"
                            class="opacity-50 !size-4"
                        />
                        {{ formatDateParts(row.registrationDate).date }}
                    </div>
                    <Icon
                        name="solar:arrow-right-bold-duotone"
                        class="size-5 mt-0.5 shrink-0 opacity-50"
                    />
                    <div class="flex items-start gap-1.5">
                        <Icon
                            name="solar:watch-square-line-duotone"
                            class="opacity-50 !size-4"
                        />
                        {{ formatDateParts(row.registrationDate).time }}
                    </div>
                </div>
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
            </div>
        </template>
    </PageTable>
</template>

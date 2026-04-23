<script setup lang="ts">
import type { BookingCalendarViewMode } from '~/composables/useBookingCalendarView';

type Props = {
    searchQuery: string;
    viewMode: BookingCalendarViewMode;
    rangeLabel: string;
    isFullscreen?: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'update:search-query', value: string): void;
    (e: 'update:view-mode', value: BookingCalendarViewMode): void;
    (e: 'go-prev'): void;
    (e: 'go-next'): void;
    (e: 'go-today'): void;
    (e: 'open-filter'): void;
    (e: 'toggle-fullscreen'): void;
}>();

const localSearchQuery = computed({
    get: () => props.searchQuery,
    set: (value: string) => emit('update:search-query', value),
});

function onViewModeChange(value: string | string[] | undefined) {
    if (typeof value === 'string' && value.length > 0) {
        emit('update:view-mode', value as BookingCalendarViewMode);
    }
}
</script>

<template>
    <div class="rounded-xl border bg-card/90 p-3 md:p-4 space-y-3 shadow-sm">
        <div class="flex flex-col xl:flex-row xl:items-center gap-3">
            <FormItemInput
                v-model="localSearchQuery"
                :placeholder="$t('booking.calendar.search_placeholder')"
                icon="solar:magnifer-linear"
                class="w-full xl:max-w-sm"
            />

            <div class="flex flex-wrap items-center gap-2 xl:ml-auto">
                <Button
                    variant="outline"
                    size="sm"
                    @click="emit('open-filter')"
                >
                    <Icon
                        name="solar:filter-linear"
                        class="size-4"
                    />
                    {{ $t('booking.calendar.actions.filter') }}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="emit('go-prev')"
                >
                    <Icon
                        name="solar:alt-arrow-left-linear"
                        class="size-4"
                    />
                    {{ $t('booking.calendar.actions.prev') }}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="emit('go-today')"
                >
                    {{ $t('booking.calendar.actions.today') }}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="emit('go-next')"
                >
                    {{ $t('booking.calendar.actions.next') }}
                    <Icon
                        name="solar:alt-arrow-right-linear"
                        class="size-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="emit('toggle-fullscreen')"
                >
                    <Icon
                        :name="isFullscreen ? 'solar:minimize-square-2-outline' : 'solar:maximize-square-3-outline'"
                        class="size-4"
                    />
                    {{ isFullscreen ? $t('booking.calendar.actions.exit_fullscreen') : $t('booking.calendar.actions.fullscreen') }}
                </Button>
            </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div class="flex flex-col lg:flex-row gap-2 w-full md:w-auto">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    :model-value="viewMode"
                    class="w-full md:w-auto md:min-w-[560px]"
                    @update:model-value="onViewModeChange"
                >
                    <ToggleGroupItem value="day">
                        {{ $t('booking.calendar.view.day') }}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="3days">
                        {{ $t('booking.calendar.view.three_days') }}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="week">
                        {{ $t('booking.calendar.view.week') }}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="2weeks">
                        {{ $t('booking.calendar.view.two_weeks') }}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="month">
                        {{ $t('booking.calendar.view.month') }}
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div class="text-xs md:text-sm font-medium text-foreground md:text-right space-y-0.5">
                <p>{{ rangeLabel }}</p>
                <p class="text-muted-foreground font-normal">
                    {{ $t('booking.calendar.granularity.half_hour') }}
                </p>
            </div>
        </div>
    </div>
</template>

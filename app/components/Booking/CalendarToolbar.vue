<script setup lang="ts">
import type { BookingCalendarViewMode } from '~/composables/useBookingCalendarView';

type Props = {
    searchQuery: string;
    viewMode: BookingCalendarViewMode;
    showRejected: boolean;
    showCanceled: boolean;
    isFullscreen?: boolean;
    selectedRange: string | [string, string] | null;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:search-query': [value: string];
    'update:view-mode': [value: BookingCalendarViewMode];
    'go-prev': [];
    'go-next': [];
    'go-today': [];
    'update:show-rejected': [value: boolean];
    'update:show-canceled': [value: boolean];
    'toggle-fullscreen': [];
    'update:selected-range': [value: string | [string, string] | null];
}>();

const localSearchQuery = computed({
    get: () => props.searchQuery,
    set: (value: string) => emit('update:search-query', value),
});

const localShowRejected = computed({
    get: () => props.showRejected,
    set: (value: boolean) => emit('update:show-rejected', value),
});

const localShowCanceled = computed({
    get: () => props.showCanceled,
    set: (value: boolean) => emit('update:show-canceled', value),
});

const selectedRangeModel = computed({
    get: () => (props.selectedRange === null ? undefined : props.selectedRange),
    set: (value: string | [string, string] | Date | Record<string, unknown> | undefined) => {
        if (value === undefined) {
            emit('update:selected-range', null);
            return;
        }
        if (typeof value === 'string' || (Array.isArray(value) && value.length === 2)) {
            emit('update:selected-range', value as string | [string, string]);
        }
    },
});

function onViewModeChange(payload: unknown) {
    if (payload === null || payload === undefined) return;
    const v = Array.isArray(payload) ? payload[0] : payload;
    if (typeof v === 'string' && v.length > 0) {
        emit('update:view-mode', v as BookingCalendarViewMode);
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

            <div class="flex flex-wrap items-center gap-3 xl:ml-auto">
                <div class="inline-flex items-center gap-2">
                    <span class="text-xs font-medium text-muted-foreground">
                        {{ $t('booking.calendar.legend.rejected') }}
                    </span>
                    <Switch
                        id="toggle-show-rejected"
                        v-model="localShowRejected"
                    />
                </div>
                <div class="inline-flex items-center gap-2">
                    <span class="text-xs font-medium text-muted-foreground">
                        {{ $t('booking.calendar.legend.canceled') }}
                    </span>
                    <Switch
                        id="toggle-show-canceled"
                        v-model="localShowCanceled"
                    />
                </div>
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

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 min-w-0">
            <div class="flex flex-col lg:flex-row gap-2 w-full min-w-0">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    size="sm"
                    :model-value="viewMode"
                    class="w-full min-w-0 flex-wrap justify-start"
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

            <div class="w-full md:max-w-[380px] min-w-0">
                <FormItemDatePicker
                    v-model="selectedRangeModel"
                    :placeholder="$t('booking.calendar.date_range_placeholder')"
                    :time-picker="false"
                    :range="viewMode !== 'day'"
                    :auto-apply="true"
                />
            </div>
        </div>
    </div>
</template>

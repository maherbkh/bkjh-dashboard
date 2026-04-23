<script setup lang="ts">
import type {
    BookingCalendarCar,
    BookingDayCellData,
    BookingRangeCellData,
    BookingCalendarViewMode,
} from '~/composables/useBookingCalendarView';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
    cars: BookingCalendarCar[];
    visibleDates: Date[];
    viewMode: BookingCalendarViewMode;
    getDayCellData: (carId: string, day: Date) => BookingDayCellData;
    getRangeCellData: (carId: string) => BookingRangeCellData;
};

const props = defineProps<Props>();
const { formatDate, formatDateOnly, formatDate: formatDateTimeDisplay } = useGermanDateFormat();

const showTimeScale = computed(() => {
    return props.viewMode === 'day' || props.viewMode === '3days';
});
const isContinuousRangeView = computed(() => {
    return props.viewMode === 'month' || props.viewMode === '2weeks';
});
const isThinSessionView = computed(() => {
    return props.viewMode === 'week' || props.viewMode === '2weeks' || props.viewMode === 'month';
});

const dayColumnWidth = computed(() => {
    switch (props.viewMode) {
        case 'day':
            return 460;
        case '3days':
            return 300;
        case 'week':
            return 260;
        case '2weeks':
            return 190;
        case 'month':
            return 150;
        default:
            return 220;
    }
});

const dayHeaderDateFormat = computed(() => {
    if (props.viewMode === '2weeks' || props.viewMode === 'month') {
        return 'DD.MM';
    }
    return 'DD.MM.YYYY';
});

const shouldFitDatesToWidth = computed(() => {
    const fitViews: BookingCalendarViewMode[] = ['week', '2weeks', 'month'];
    return fitViews.includes(props.viewMode);
});

const gridTemplateColumns = computed(() => {
    if (shouldFitDatesToWidth.value) {
        return `6rem repeat(${props.visibleDates.length}, minmax(0, 1fr))`;
    }
    return `16rem repeat(${props.visibleDates.length}, minmax(${dayColumnWidth.value}px, 1fr))`;
});

function segmentClass(status: BookingDayCellData['segments'][number]['status'], isStart: boolean, isEnd: boolean): string {
    const shape = isStart && isEnd
        ? 'rounded-[6px]'
        : isStart
            ? 'rounded-l-[6px] rounded-r-[2px]'
            : isEnd
                ? 'rounded-r-[6px] rounded-l-[2px]'
                : 'rounded-[2px]';
    const rangeShape = 'rounded-full';
    const base = `absolute top-1 ${isThinSessionView.value ? 'h-2' : 'h-[20px]'} border shadow-sm transition-colors duration-150 ${isContinuousRangeView.value ? rangeShape : shape}`;

    if (status === 'approved') {
        return `${base} bg-success/80 border-success/90`;
    }
    if (status === 'pending') {
        return `${base} bg-warning/75 border-warning/85`;
    }
    if (status === 'rejected') {
        return `${base} bg-destructive/75 border-destructive/85`;
    }
    if (status === 'canceled') {
        return `${base} bg-muted border-muted-foreground/45`;
    }
    return `${base} bg-background border-border/65`;
}

function formatDateTime(value: Date): string {
    return formatDateTimeDisplay(value, 'DD.MM.YYYY, HH:mm');
}

function getLaneStepPx(): number {
    // h-2 (8px) + gap-1 (4px) in thin timeline views
    return isThinSessionView.value ? 12 : 22;
}

function getSegmentTopPx(lane: number): string {
    const baseTop = isThinSessionView.value ? 1 : 4;
    return `${(lane * getLaneStepPx()) + baseTop}px`;
}

function getCellMinHeightPx(laneCount: number): string {
    if (isThinSessionView.value) {
        return `${Math.max(12, laneCount * getLaneStepPx() + 4)}px`;
    }
    return `${Math.max(28, laneCount * getLaneStepPx() + 8)}px`;
}
</script>

<template>
    <div class="rounded-xl border bg-card shadow-sm">
        <div class="max-h-[72vh] overflow-auto">
            <div
                :class="shouldFitDatesToWidth ? 'w-full min-w-0' : 'min-w-max'"
                :style="{
                    minWidth: shouldFitDatesToWidth ? undefined : `${256 + (visibleDates.length * dayColumnWidth)}px`,
                }"
            >
                <div
                    class="sticky top-0 z-30 grid border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/85"
                    :style="{ gridTemplateColumns }"
                >
                    <div class="sticky left-0 z-40 border-r bg-card p-2.5 min-w-0 max-w-64">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {{ $t('booking.calendar.car_column') }}
                        </p>
                    </div>

                    <div
                        v-for="day in visibleDates"
                        :key="day.toISOString()"
                        class="border-r last:border-r-0 px-2 py-1.5 text-left bg-muted/20"
                    >
                        <p class="text-[10px] font-semibold text-foreground">
                            {{ formatDate(day, 'ddd') }}
                        </p>
                        <p class="text-[9px] text-muted-foreground">
                            {{ formatDate(day, dayHeaderDateFormat) }}
                        </p>
                        <div
                            v-if="showTimeScale"
                            class="mt-1 flex justify-between text-[8px] text-muted-foreground/85"
                        >
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                        </div>
                    </div>
                </div>

                <template v-if="cars.length > 0">
                    <div class="divide-y divide-border/70">
                        <div
                            v-for="car in cars"
                            :key="car.id"
                            class="grid hover:bg-muted/20"
                            :style="{ gridTemplateColumns }"
                        >
                            <div class="sticky left-0 z-20 border-r bg-card/95 p-2.5 backdrop-blur min-w-0 max-w-64">
                                <p class="text-xs font-semibold leading-tight truncate">
                                    {{ car.name }}
                                </p>
                                <p class="text-[11px] text-muted-foreground truncate">
                                    {{ car.plateNumber }}
                                </p>
                            </div>

                            <template v-if="!isContinuousRangeView">
                                <div
                                    v-for="day in visibleDates"
                                    :key="`${car.id}-${day.toISOString()}`"
                                    class="border-r last:border-r-0 p-1 bg-muted/5"
                                >
                                    <div
                                        class="relative rounded-md border border-border/55 bg-background/80"
                                        :style="{
                                            minHeight: getCellMinHeightPx(getDayCellData(car.id, day).laneCount),
                                            backgroundImage: showTimeScale
                                                ? 'repeating-linear-gradient(to right, hsl(var(--border) / 0.18) 0, hsl(var(--border) / 0.18) 1px, transparent 1px, transparent calc(100% / 48)), repeating-linear-gradient(to right, hsl(var(--border) / 0.38) 0, hsl(var(--border) / 0.38) 1px, transparent 1px, transparent calc(100% / 24))'
                                                : 'repeating-linear-gradient(to right, hsl(var(--border) / 0.30) 0, hsl(var(--border) / 0.30) 1px, transparent 1px, transparent calc(100% / 24))',
                                        }"
                                    >
                                        <div
                                            v-for="segment in getDayCellData(car.id, day).segments"
                                            :key="`${segment.bookingId}-${segment.lane}`"
                                        >
                                            <Tooltip>
                                                <TooltipTrigger as-child>
                                                    <button
                                                        type="button"
                                                        :class="segmentClass(segment.status, segment.isStart, segment.isEnd)"
                                                        :style="{
                                                            left: `${segment.leftPct}%`,
                                                            width: `${segment.widthPct}%`,
                                                            top: getSegmentTopPx(segment.lane),
                                                        }"
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    align="start"
                                                    class="max-w-xs text-xs bg-popover text-popover-foreground border border-border shadow-md rounded-lg px-3 py-2"
                                                >
                                                    <div class="space-y-1.5">
                                                        <p class="font-semibold text-foreground">
                                                            {{ car.name }} ({{ car.plateNumber }})
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.status') }}: {{ segment.label }}
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.requester') }}: {{ segment.requesterName }}
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.email') }}: {{ segment.requesterEmail }}
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.start') }}: {{ formatDateTime(segment.startsAt) }}
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.end') }}: {{ formatDateTime(segment.endsAt) }}
                                                        </p>
                                                        <p class="text-muted-foreground">
                                                            {{ $t('booking.calendar.tooltip.safe_reference') }}: {{ segment.safeReference }}
                                                        </p>
                                                        <p
                                                            v-if="segment.groupId"
                                                            class="text-muted-foreground"
                                                        >
                                                            {{ $t('booking.calendar.tooltip.group_id') }}: {{ segment.groupName || segment.groupId }}
                                                        </p>
                                                        <p
                                                            v-if="segment.safePinAvailable"
                                                            class="text-primary font-medium"
                                                        >
                                                            {{ $t('booking.calendar.safe_pin_available') }}: {{ segment.safePin }}
                                                        </p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </template>
                            <div
                                v-else
                                class="border-r last:border-r-0 bg-muted/5"
                                :style="{ gridColumn: `2 / span ${visibleDates.length}` }"
                            >
                                <div
                                    class="relative"
                                    :style="{
                                        'minHeight': getCellMinHeightPx(getRangeCellData(car.id).laneCount),
                                        'backgroundImage': 'repeating-linear-gradient(to right, hsl(var(--border) / 0.30) 0, hsl(var(--border) / 0.30) 1px, transparent 1px, transparent calc(100% / var(--day-count)))',
                                        '--day-count': String(visibleDates.length),
                                    }"
                                >
                                    <div
                                        v-for="segment in getRangeCellData(car.id).segments"
                                        :key="`${segment.bookingId}-${segment.lane}`"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <button
                                                    type="button"
                                                    :class="segmentClass(segment.status, segment.isStart, segment.isEnd)"
                                                    :style="{
                                                        left: `${segment.leftPct}%`,
                                                        width: `${segment.widthPct}%`,
                                                        top: getSegmentTopPx(segment.lane),
                                                    }"
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent
                                                align="start"
                                                class="max-w-xs text-xs bg-popover text-popover-foreground border border-border shadow-md rounded-lg px-3 py-2"
                                            >
                                                <div class="space-y-1.5">
                                                    <p class="font-semibold text-foreground">
                                                        {{ car.name }} ({{ car.plateNumber }})
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.status') }}: {{ segment.label }}
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.requester') }}: {{ segment.requesterName }}
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.email') }}: {{ segment.requesterEmail }}
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.start') }}: {{ formatDateTime(segment.startsAt) }}
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.end') }}: {{ formatDateTime(segment.endsAt) }}
                                                    </p>
                                                    <p class="text-muted-foreground">
                                                        {{ $t('booking.calendar.tooltip.safe_reference') }}: {{ segment.safeReference }}
                                                    </p>
                                                    <p
                                                        v-if="segment.groupId"
                                                        class="text-muted-foreground"
                                                    >
                                                        {{ $t('booking.calendar.tooltip.group_id') }}: {{ segment.groupName || segment.groupId }}
                                                    </p>
                                                    <p
                                                        v-if="segment.safePinAvailable"
                                                        class="text-primary font-medium"
                                                    >
                                                        {{ $t('booking.calendar.safe_pin_available') }}: {{ segment.safePin }}
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <div
                    v-else
                    class="p-10 text-center text-sm text-muted-foreground"
                >
                    {{ $t('booking.calendar.empty') }}
                </div>
            </div>
        </div>
    </div>
</template>

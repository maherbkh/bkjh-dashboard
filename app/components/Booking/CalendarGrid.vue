<script setup lang="ts">
import type {
    BookingCalendarCar,
    BookingDayCellData,
    BookingRangeCellData,
    BookingCalendarViewMode,
} from '~/composables/useBookingCalendarView';
import type { BookingActionSelection } from '~/composables/useBookingActions';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
    cars?: BookingCalendarCar[];
    visibleDates?: Date[];
    viewMode: BookingCalendarViewMode;
    getDayCellData: (carId: string, day: Date) => BookingDayCellData;
    getRangeCellData: (carId: string) => BookingRangeCellData;
};

const props = withDefaults(defineProps<Props>(), {
    cars: () => [],
    visibleDates: () => [],
});
const emit = defineEmits<{
    (e: 'select-action', payload: BookingActionSelection): void;
}>();
const { formatDate, formatDateOnly, formatDate: formatDateTimeDisplay } = useGermanDateFormat();

const PRESET_LENGTH: Record<Exclude<BookingCalendarViewMode, 'month'>, number> = {
    'day': 1,
    '3days': 3,
    'week': 7,
    '2weeks': 14,
};

function resolveStyleModeByDayCount(dayCount: number): BookingCalendarViewMode {
    if (dayCount <= 1) return 'day';
    if (dayCount <= 3) return '3days';
    if (dayCount <= 7) return 'week';
    if (dayCount <= 14) return '2weeks';
    return 'month';
}

const effectiveDayCount = computed(() => props.visibleDates.length);
const isCustomRangeActive = computed(() => {
    if (props.viewMode === 'month') {
        return effectiveDayCount.value !== 28
            && effectiveDayCount.value !== 29
            && effectiveDayCount.value !== 30
            && effectiveDayCount.value !== 31;
    }
    return effectiveDayCount.value !== PRESET_LENGTH[props.viewMode];
});
const effectiveStyleMode = computed<BookingCalendarViewMode>(() => {
    if (!isCustomRangeActive.value) {
        return props.viewMode;
    }
    return resolveStyleModeByDayCount(effectiveDayCount.value);
});

const showTimeScale = computed(() => {
    return effectiveStyleMode.value === 'day' || effectiveStyleMode.value === '3days';
});
const isContinuousRangeView = computed(() => {
    return effectiveStyleMode.value === 'month' || effectiveStyleMode.value === '2weeks';
});
const isThinSessionView = computed(() => {
    return effectiveStyleMode.value === 'week' || effectiveStyleMode.value === '2weeks' || effectiveStyleMode.value === 'month';
});
const hideInnerDayBorder = computed(() => {
    return effectiveStyleMode.value === 'week';
});

const dayHeaderDateFormat = computed(() => {
    if (props.visibleDates.length > 60) {
        return 'DD.MM';
    }
    if (effectiveStyleMode.value === '2weeks' || effectiveStyleMode.value === 'month') {
        return 'DD.MM';
    }
    return 'DD.MM.YYYY';
});

const dayHeaderWeekdayFormat = computed(() => {
    return props.visibleDates.length > 45 ? 'dd' : 'ddd';
});

const dayCount = computed(() => props.visibleDates.length);
const leftColumnWidthPx = 96;
const isLongRange = computed(() => dayCount.value > 30);

const dayColumnMinWidthPx = computed(() => {
    if (dayCount.value > 60) return 60;
    if (dayCount.value > 45) return 52;
    return 44;
});

const gridTemplateColumns = computed(() => {
    if (isLongRange.value) {
        return `${leftColumnWidthPx}px repeat(${dayCount.value}, minmax(${dayColumnMinWidthPx.value}px, 1fr))`;
    }
    return `${leftColumnWidthPx}px repeat(${dayCount.value}, minmax(0, 1fr))`;
});

const timelineMinWidthPx = computed(() => {
    if (!isLongRange.value) return 0;
    return leftColumnWidthPx + dayCount.value * dayColumnMinWidthPx.value;
});

const timelineInnerStyle = computed(() => {
    return {
        minWidth: isLongRange.value ? `${timelineMinWidthPx.value}px` : '100%',
    };
});

const dayHeaderCellClass = computed(() => {
    return isLongRange.value
        ? 'border-r last:border-r-0 px-1.5 py-1 text-left'
        : 'border-r last:border-r-0 px-2 py-1.5 text-left';
});

const dayHeaderWeekdayClass = computed(() => {
    return isLongRange.value ? 'text-[9px] font-semibold leading-tight' : 'text-[10px] font-semibold';
});

const dayHeaderDateClass = computed(() => {
    return isLongRange.value ? 'text-[8px] leading-tight text-muted-foreground' : 'text-[9px] text-muted-foreground';
});

function segmentClass(status: BookingDayCellData['segments'][number]['status'], isStart: boolean, isEnd: boolean): string {
    const shape = isContinuousRangeView.value
        ? (
                isStart && isEnd
                    ? 'rounded-full'
                    : isStart
                        ? 'rounded-l-full rounded-r-[2px]'
                        : isEnd
                            ? 'rounded-r-full rounded-l-none'
                            : 'rounded-none'
            )
        : (
                isStart && isEnd
                    ? 'rounded-[6px]'
                    : isStart
                        ? 'rounded-l-[6px] rounded-r-[2px]'
                        : isEnd
                            ? 'rounded-r-[6px] rounded-l-none'
                            : 'rounded-none'
            );
    const base = `absolute top-1 ${isThinSessionView.value ? 'h-2' : 'h-[20px]'} cursor-pointer border shadow-sm origin-center transition-transform transition-colors duration-300 ease-in-out hover:scale-[1.03] ${shape}`;

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
    // In thin views keep a visual py-2 (8px top + 8px bottom)
    // and center the lane stack inside each vehicle row.
    const baseTop = isThinSessionView.value ? 8 : 4;
    return `${(lane * getLaneStepPx()) + baseTop}px`;
}

function getCellMinHeightPx(laneCount: number): string {
    if (isThinSessionView.value) {
        // Exact stack height for h-2 + gap-1 lanes:
        // n * 8px + (n - 1) * 4px
        const exactThinStackHeight = (laneCount * 8) + ((laneCount - 1) * 4);
        // Add py-2 around the stack: 8px top + 8px bottom.
        return `${Math.max(24, exactThinStackHeight + 16)}px`;
    }
    return `${Math.max(28, laneCount * getLaneStepPx() + 8)}px`;
}

function getWeekRowLaneCount(carId: string): number {
    if (props.viewMode !== 'week') {
        return 1;
    }

    return props.visibleDates.reduce((max, day) => {
        const laneCount = props.getDayCellData(carId, day).laneCount;
        return Math.max(max, laneCount);
    }, 1);
}

function getDayCellMinHeight(carId: string, day: Date): string {
    if (props.viewMode === 'week') {
        return getCellMinHeightPx(getWeekRowLaneCount(carId));
    }
    return getCellMinHeightPx(props.getDayCellData(carId, day).laneCount);
}

function isTodayDate(day: Date): boolean {
    const today = new Date();
    return day.getFullYear() === today.getFullYear()
        && day.getMonth() === today.getMonth()
        && day.getDate() === today.getDate();
}

function shouldHighlightToday(): boolean {
    return props.viewMode === 'week' || props.viewMode === '2weeks' || props.viewMode === 'month';
}
</script>

<template>
    <div class="rounded-xl border bg-card shadow-sm min-w-0 max-w-full overflow-hidden">
        <div class="scroll-app max-h-[72vh] overflow-y-auto overflow-x-hidden">
            <div
                class="scroll-app w-full max-w-full overflow-x-auto overflow-y-hidden"
                tabindex="0"
                :aria-label="$t('booking.cars_booking.title')"
            >
                <div
                    class="w-full min-w-max"
                    :style="timelineInnerStyle"
                >
                    <div
                        class="sticky top-0 z-30 grid border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/85"
                        :style="{ gridTemplateColumns }"
                    >
                        <div
                            class="sticky left-0 z-40 border-r bg-card p-2.5 min-w-0"
                            :style="{ width: `${leftColumnWidthPx}px`, minWidth: `${leftColumnWidthPx}px` }"
                        >
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {{ $t('booking.calendar.car_column') }}
                            </p>
                        </div>

                        <div
                            v-for="day in visibleDates"
                            :key="day.toISOString()"
                            :class="[
                                dayHeaderCellClass,
                                shouldHighlightToday() && isTodayDate(day)
                                    ? 'bg-primary/10 ring-1 ring-inset ring-primary/40'
                                    : 'bg-muted/20',
                            ]"
                        >
                            <p
                                :class="[
                                    dayHeaderWeekdayClass,
                                    shouldHighlightToday() && isTodayDate(day) ? 'text-primary' : 'text-foreground',
                                ]"
                            >
                                {{ formatDate(day, dayHeaderWeekdayFormat) }}
                            </p>
                            <p :class="dayHeaderDateClass">
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
                                v-for="(car, carIndex) in cars"
                                :key="car.id"
                                :class="[
                                    'grid transition-colors',
                                    carIndex % 2 === 0 ? 'bg-muted/50' : 'bg-background',
                                    'hover:bg-muted/60',
                                ]"
                                :style="{ gridTemplateColumns }"
                            >
                                <div
                                    class="sticky left-0 z-20 border-r bg-card/95 p-2.5 backdrop-blur min-w-0 flex flex-col justify-center"
                                    :style="{ width: `${leftColumnWidthPx}px`, minWidth: `${leftColumnWidthPx}px` }"
                                >
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
                                        :class="[
                                            'border-r last:border-r-0 p-1',
                                            shouldHighlightToday() && isTodayDate(day) ? 'bg-primary/5' : 'bg-muted/5',
                                        ]"
                                    >
                                        <div
                                            :class="[
                                                'relative rounded-md bg-background/80 overflow-hidden',
                                                hideInnerDayBorder ? '' : 'border border-border/55',
                                            ]"
                                            :style="{
                                                minHeight: getDayCellMinHeight(car.id, day),
                                                backgroundImage: showTimeScale
                                                    ? 'repeating-linear-gradient(to right, hsl(var(--border) / 0.18) 0, hsl(var(--border) / 0.18) 1px, transparent 1px, transparent calc(100% / 48)), repeating-linear-gradient(to right, hsl(var(--border) / 0.38) 0, hsl(var(--border) / 0.38) 1px, transparent 1px, transparent calc(100% / 24))'
                                                    : 'repeating-linear-gradient(to right, hsl(var(--border) / 0.30) 0, hsl(var(--border) / 0.30) 1px, transparent 1px, transparent calc(100% / 24))',
                                            }"
                                        >
                                            <div
                                                v-for="segment in getDayCellData(car.id, day).segments"
                                                :key="`${segment.bookingId}-${segment.lane}`"
                                            >
                                                <BookingActionMenu
                                                    :segment="segment"
                                                    @select-action="emit('select-action', $event)"
                                                >
                                                    <div class="contents">
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
                                                                    <p
                                                                        v-if="segment.safeReference"
                                                                        class="text-muted-foreground"
                                                                    >
                                                                        {{ $t('booking.calendar.tooltip.safe_reference') }}: {{ segment.safeReference }}
                                                                    </p>
                                                                    <p
                                                                        v-if="segment.groupId"
                                                                        class="text-muted-foreground"
                                                                    >
                                                                        {{ $t('booking.calendar.tooltip.group_id') }}: {{ segment.groupName || segment.groupId }}
                                                                    </p>
                                                                    <p
                                                                        v-if="segment.safePinAvailable && segment.safePin"
                                                                        class="text-primary font-medium"
                                                                    >
                                                                        {{ $t('booking.calendar.safe_pin_available') }}: {{ segment.safePin }}
                                                                    </p>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </BookingActionMenu>
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
                                        class="relative overflow-hidden"
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
                                            <BookingActionMenu
                                                :segment="segment"
                                                @select-action="emit('select-action', $event)"
                                            >
                                                <div class="contents">
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
                                                                <p
                                                                    v-if="segment.safeReference"
                                                                    class="text-muted-foreground"
                                                                >
                                                                    {{ $t('booking.calendar.tooltip.safe_reference') }}: {{ segment.safeReference }}
                                                                </p>
                                                                <p
                                                                    v-if="segment.groupId"
                                                                    class="text-muted-foreground"
                                                                >
                                                                    {{ $t('booking.calendar.tooltip.group_id') }}: {{ segment.groupName || segment.groupId }}
                                                                </p>
                                                                <p
                                                                    v-if="segment.safePinAvailable && segment.safePin"
                                                                    class="text-primary font-medium"
                                                                >
                                                                    {{ $t('booking.calendar.safe_pin_available') }}: {{ segment.safePin }}
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </BookingActionMenu>
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
    </div>
</template>

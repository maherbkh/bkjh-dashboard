import { carBookingsDemoPayload } from '~/data/booking/carBookingsDemoPayload';
import type { Car } from '~/types';

export type BookingCalendarViewMode = 'day' | '3days' | 'week' | '2weeks' | 'month';
export type BookingApiStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';
export type BookingCellStatus = 'available' | 'pending' | 'approved' | 'rejected' | 'canceled';

export type BookingCalendarCar = {
    id: string;
    name: string;
    plateNumber: string;
};

type BookingCalendarSlot = {
    id: string;
    carId: string;
    start: Date;
    end: Date;
    status: BookingApiStatus;
    requesterName: string;
    requesterEmail: string;
    groupId: string | null;
    safeReference: string;
    safePin: string;
    safePinAvailable: boolean;
};

export type BookingCalendarCellMeta = {
    status: BookingCellStatus;
    label: string;
    isOccupied: boolean;
    isStart: boolean;
    isEnd: boolean;
    bookingId: string | null;
    tooltip: string;
};

export type BookingDaySegment = {
    bookingId: string;
    status: BookingCellStatus;
    label: string;
    tooltip: string;
    startsAt: Date;
    endsAt: Date;
    requesterName: string;
    requesterEmail: string;
    groupId: string | null;
    groupName: string | null;
    safeReference: string;
    safePin: string;
    safePinAvailable: boolean;
    leftPct: number;
    widthPct: number;
    lane: number;
    isStart: boolean;
    isEnd: boolean;
};

export type BookingDayCellData = {
    segments: BookingDaySegment[];
    laneCount: number;
};

export type BookingRangeCellData = {
    segments: BookingDaySegment[];
    laneCount: number;
};

export type BookingTimelineSlot = {
    key: string;
    start: Date;
    end: Date;
    dayKey: string;
    slotIndex: number;
    isDayStart: boolean;
    isHourStart: boolean;
    isLabelTick: boolean;
    timeLabel: string;
    dayLabel: string;
    dayDateLabel: string;
};

type CarBookingListItem = {
    id: string;
    carId: string;
    startsAt: string;
    endsAt: string;
    status: BookingApiStatus;
    requesterName: string;
    requesterEmail: string;
    groupId: string | null;
    safeReference: string;
    safePin: string;
    createdAt: string;
    updatedAt: string;
};

type CarsIndexPayload = {
    data: Car[];
    meta: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        from: number;
        to: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
};

type GroupsIndexItem = {
    id: string | number;
    name: string;
};

type GroupsIndexPayload = {
    data: GroupsIndexItem[];
    meta: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        from: number;
        to: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
};

const VIEW_LENGTH: Record<Exclude<BookingCalendarViewMode, 'month'>, number> = {
    day: 1,
    '3days': 3,
    week: 7,
    '2weeks': 14,
};

function normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return normalizeDate(next);
}

function createDateRange(start: Date, end: Date): Date[] {
    const result: Date[] = [];
    const cursor = normalizeDate(start);
    const to = normalizeDate(end);

    while (cursor <= to) {
        result.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return result;
}

function isDateWithin(date: Date, start: Date, end: Date): boolean {
    const value = normalizeDate(date).getTime();
    return value >= normalizeDate(start).getTime() && value <= normalizeDate(end).getTime();
}

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aEnd > bStart && aStart < bEnd;
}

function isAfterSafePinThreshold(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();
    return minutes >= (16 * 60 + 30);
}

export function useBookingCalendarView() {
    const { t } = useI18n();
    const { formatDate, formatDateOnly, formatTimeOnly } = useGermanDateFormat();

    const today = normalizeDate(new Date());
    const anchorDate = ref<Date>(today);
    const viewMode = ref<BookingCalendarViewMode>('day');
    const searchQuery = ref('');

    const apiList = carBookingsDemoPayload.responses.list.data.data as readonly CarBookingListItem[];

    const cars = ref<BookingCalendarCar[]>(
        carBookingsDemoPayload.cars.map(car => ({
            id: car.id,
            name: car.model,
            plateNumber: car.plateNumber,
        })),
    );
    const groupNameById = ref<Record<string, string>>({});

    const slots = computed<BookingCalendarSlot[]>(() => {
        const availableCarIds = cars.value.map(car => car.id);
        const fallbackCarBySourceCarId = new Map<string, string>();

        const mapped = apiList.map((booking, index) => ({
            id: booking.id,
            // Keep backend carId when available.
            // If not available, keep a stable fallback per source carId
            // so overlapping bookings on the same source car remain grouped.
            carId: (() => {
                if (availableCarIds.includes(booking.carId)) {
                    return booking.carId;
                }

                const existingFallback = fallbackCarBySourceCarId.get(booking.carId);
                if (existingFallback) {
                    return existingFallback;
                }

                const fallback = availableCarIds[index % Math.max(availableCarIds.length, 1)] ?? booking.carId;
                fallbackCarBySourceCarId.set(booking.carId, fallback);
                return fallback;
            })(),
            start: new Date(booking.startsAt),
            end: new Date(booking.endsAt),
            status: booking.status,
            requesterName: booking.requesterName,
            requesterEmail: booking.requesterEmail,
            groupId: booking.groupId,
            safeReference: booking.safeReference,
            safePin: booking.safePin,
            safePinAvailable: booking.status === 'APPROVED' && isAfterSafePinThreshold(new Date(booking.startsAt)),
        }));

        // Enforce demo business rule:
        // per car, APPROVED bookings must not overlap.
        const byCar = new Map<string, BookingCalendarSlot[]>();
        for (const booking of mapped) {
            if (!byCar.has(booking.carId)) {
                byCar.set(booking.carId, []);
            }
            byCar.get(booking.carId)!.push(booking);
        }

        const sanitized: BookingCalendarSlot[] = [];
        for (const [, carBookings] of byCar.entries()) {
            const approvedAccepted: BookingCalendarSlot[] = [];
            const ordered = [...carBookings].sort((a, b) => a.start.getTime() - b.start.getTime());

            for (const booking of ordered) {
                if (booking.status !== 'APPROVED') {
                    sanitized.push(booking);
                    continue;
                }

                const hasApprovedOverlap = approvedAccepted.some(existing =>
                    intervalsOverlap(existing.start, existing.end, booking.start, booking.end),
                );

                if (!hasApprovedOverlap) {
                    approvedAccepted.push(booking);
                    sanitized.push(booking);
                }
            }
        }

        return sanitized;
    });

    function mapBookingStatusToCellStatus(status: BookingApiStatus): Exclude<BookingCellStatus, 'available'> {
        const statusMap: Record<BookingApiStatus, Exclude<BookingCellStatus, 'available'>> = {
            APPROVED: 'approved',
            PENDING: 'pending',
            REJECTED: 'rejected',
            CANCELED: 'canceled',
        };
        return statusMap[status];
    }

    async function loadCarsFromIndex() {
        try {
            const aggregated: Car[] = [];
            let page = 1;
            let lastPage = 1;

            do {
                const response = await fetchDashboardApi<CarsIndexPayload>('/booking/cars', {
                    query: {
                        page,
                        length: 100,
                        sort_by: 'createdAt',
                        sort_dir: 'desc',
                    },
                });

                const payload = response.data;
                if (payload?.data?.length) {
                    aggregated.push(...payload.data);
                }
                lastPage = payload?.meta?.lastPage ?? 1;
                page += 1;
            } while (page <= lastPage);

            if (aggregated.length > 0) {
                cars.value = aggregated.map(car => ({
                    id: car.id,
                    name: car.model,
                    plateNumber: car.plateNumber,
                }));
            }
        }
        catch (error) {
            console.error('Failed to load cars index for booking calendar:', error);
        }
    }

    async function loadGroupsFromIndex() {
        try {
            const aggregated: GroupsIndexItem[] = [];
            let page = 1;
            let lastPage = 1;

            do {
                const response = await fetchDashboardApi<GroupsIndexPayload>('/shared/groups', {
                    query: {
                        page,
                        length: 100,
                        sort_by: 'createdAt',
                        sort_dir: 'desc',
                    },
                });

                const payload = response.data;
                if (payload?.data?.length) {
                    aggregated.push(...payload.data);
                }
                lastPage = payload?.meta?.lastPage ?? 1;
                page += 1;
            } while (page <= lastPage);

            if (aggregated.length > 0) {
                const nextMap: Record<string, string> = {};
                for (const group of aggregated) {
                    nextMap[String(group.id)] = group.name;
                }
                groupNameById.value = nextMap;
            }
        }
        catch (error) {
            console.error('Failed to load groups index for booking calendar:', error);
        }
    }

    onMounted(() => {
        loadCarsFromIndex();
        loadGroupsFromIndex();
    });

    const visibleDates = computed<Date[]>(() => {
        const anchor = normalizeDate(anchorDate.value);

        if (viewMode.value === 'month') {
            const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
            const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
            return createDateRange(monthStart, monthEnd);
        }

        const length = VIEW_LENGTH[viewMode.value];
        const rangeEnd = addDays(anchor, length - 1);
        return createDateRange(anchor, rangeEnd);
    });

    const minutesPerSlot = computed(() => 30);
    const slotsPerDay = computed(() => 48);

    const timelineSlots = computed<BookingTimelineSlot[]>(() => {
        const results: BookingTimelineSlot[] = [];

        for (const day of visibleDates.value) {
            const dayStart = normalizeDate(day);
            for (let index = 0; index < slotsPerDay.value; index += 1) {
                const slotStart = new Date(dayStart);
                slotStart.setMinutes(index * minutesPerSlot.value, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + minutesPerSlot.value);

                results.push({
                    key: `${dayStart.toISOString()}-${index}`,
                    start: slotStart,
                    end: slotEnd,
                    dayKey: dayStart.toISOString(),
                    slotIndex: index,
                    isDayStart: index === 0,
                    isHourStart: index % 2 === 0,
                    isLabelTick: index % 4 === 0,
                    timeLabel: formatTimeOnly(slotStart),
                    dayLabel: formatDate(dayStart, 'ddd'),
                    dayDateLabel: formatDateOnly(dayStart),
                });
            }
        }
        return results;
    });

    const filteredCars = computed<BookingCalendarCar[]>(() => {
        const query = searchQuery.value.trim().toLowerCase();
        if (!query) return cars.value;

        return cars.value.filter(car =>
            car.name.toLowerCase().includes(query)
            || car.plateNumber.toLowerCase().includes(query),
        );
    });

    const currentRangeLabel = computed(() => {
        const dates = visibleDates.value;
        if (!dates.length) return '';

        const first = dates[0];
        const last = dates[dates.length - 1];
        if (first.getTime() === last.getTime()) {
            return formatDateOnly(first);
        }
        return `${formatDateOnly(first)} - ${formatDateOnly(last)}`;
    });

    function setViewMode(mode: BookingCalendarViewMode) {
        viewMode.value = mode;
        if (mode === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth(), 1);
        }
    }

    function goToPreviousRange() {
        if (viewMode.value === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            return;
        }
        anchorDate.value = addDays(anchorDate.value, -VIEW_LENGTH[viewMode.value]);
    }

    function goToNextRange() {
        if (viewMode.value === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth() + 1, 1);
            return;
        }
        anchorDate.value = addDays(anchorDate.value, VIEW_LENGTH[viewMode.value]);
    }

    function goToToday() {
        const now = normalizeDate(new Date());
        anchorDate.value = viewMode.value === 'month'
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : now;
    }

    function getCellMeta(carId: string, slotStart: Date, slotEnd: Date): BookingCalendarCellMeta {
        const matchedSlots = slots.value.filter(slot =>
            slot.carId === carId && intervalsOverlap(slot.start, slot.end, slotStart, slotEnd),
        );

        if (matchedSlots.length === 0) {
            return {
                status: 'available',
                label: t('booking.calendar.legend.available'),
                isOccupied: false,
                isStart: false,
                isEnd: false,
                bookingId: null,
                tooltip: t('booking.calendar.legend.available'),
            };
        }

        const precedence: BookingApiStatus[] = ['APPROVED', 'PENDING', 'REJECTED', 'CANCELED'];
        const dominantStatus = precedence.find(status => matchedSlots.some(item => item.status === status)) || 'PENDING';
        const dominantBooking = matchedSlots.find(item => item.status === dominantStatus) || matchedSlots[0];
        const mappedStatus = mapBookingStatusToCellStatus(dominantStatus);
        const isStart = dominantBooking.start >= slotStart && dominantBooking.start < slotEnd;
        const isEnd = dominantBooking.end > slotStart && dominantBooking.end <= slotEnd;

        return {
            status: mappedStatus,
            label: t(`booking.calendar.legend.${mappedStatus}`),
            isOccupied: true,
            isStart,
            isEnd,
            bookingId: dominantBooking.id,
            tooltip: `${dominantBooking.requesterName} - ${t(`booking.calendar.legend.${mappedStatus}`)} - ${dominantBooking.safeReference}${dominantBooking.safePinAvailable ? ` - ${t('booking.calendar.safe_pin_available')}: ${dominantBooking.safePin}` : ''}`,
        };
    }

    function getDayCellData(carId: string, day: Date): BookingDayCellData {
        const dayStart = normalizeDate(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const source = slots.value
            .filter(slot => slot.carId === carId && intervalsOverlap(slot.start, slot.end, dayStart, dayEnd))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        const laneEndMinutes: number[] = [];
        const segments: BookingDaySegment[] = source.map((slot) => {
            const segmentStart = slot.start > dayStart ? slot.start : dayStart;
            const segmentEnd = slot.end < dayEnd ? slot.end : dayEnd;

            const startMin = Math.max(0, (segmentStart.getTime() - dayStart.getTime()) / 60000);
            const endMin = Math.min(1440, (segmentEnd.getTime() - dayStart.getTime()) / 60000);

            let lane = laneEndMinutes.findIndex(end => startMin >= end);
            if (lane === -1) {
                lane = laneEndMinutes.length;
                laneEndMinutes.push(endMin);
            }
            else {
                laneEndMinutes[lane] = endMin;
            }

            const status = mapBookingStatusToCellStatus(slot.status);
            const isStart = slot.start >= dayStart && slot.start < dayEnd;
            const isEnd = slot.end > dayStart && slot.end <= dayEnd;

            return {
                bookingId: slot.id,
                status,
                label: t(`booking.calendar.legend.${status}`),
                tooltip: `${slot.requesterName} - ${t(`booking.calendar.legend.${status}`)} - ${slot.safeReference}${slot.safePinAvailable ? ` - ${t('booking.calendar.safe_pin_available')}: ${slot.safePin}` : ''}`,
                startsAt: slot.start,
                endsAt: slot.end,
                requesterName: slot.requesterName,
                requesterEmail: slot.requesterEmail,
                groupId: slot.groupId,
                groupName: slot.groupId ? (groupNameById.value[String(slot.groupId)] ?? null) : null,
                safeReference: slot.safeReference,
                safePin: slot.safePin,
                safePinAvailable: slot.safePinAvailable,
                leftPct: (startMin / 1440) * 100,
                widthPct: Math.max(((endMin - startMin) / 1440) * 100, 0.6),
                lane,
                isStart,
                isEnd,
            };
        });

        return {
            segments,
            laneCount: Math.max(laneEndMinutes.length, 1),
        };
    }

    function getRangeCellData(carId: string): BookingRangeCellData {
        if (visibleDates.value.length === 0) {
            return { segments: [], laneCount: 1 };
        }

        const rangeStart = normalizeDate(visibleDates.value[0]);
        const rangeEnd = new Date(normalizeDate(visibleDates.value[visibleDates.value.length - 1]));
        rangeEnd.setDate(rangeEnd.getDate() + 1);

        const source = slots.value
            .filter(slot => slot.carId === carId && intervalsOverlap(slot.start, slot.end, rangeStart, rangeEnd))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        const totalMinutes = Math.max(1, (rangeEnd.getTime() - rangeStart.getTime()) / 60000);
        const laneEndMinutes: number[] = [];

        const segments: BookingDaySegment[] = source.map((slot) => {
            const segmentStart = slot.start > rangeStart ? slot.start : rangeStart;
            const segmentEnd = slot.end < rangeEnd ? slot.end : rangeEnd;

            const startMin = Math.max(0, (segmentStart.getTime() - rangeStart.getTime()) / 60000);
            const endMin = Math.min(totalMinutes, (segmentEnd.getTime() - rangeStart.getTime()) / 60000);

            let lane = laneEndMinutes.findIndex(end => startMin >= end);
            if (lane === -1) {
                lane = laneEndMinutes.length;
                laneEndMinutes.push(endMin);
            }
            else {
                laneEndMinutes[lane] = endMin;
            }

            const status = mapBookingStatusToCellStatus(slot.status);
            const isStart = slot.start >= rangeStart && slot.start < rangeEnd;
            const isEnd = slot.end > rangeStart && slot.end <= rangeEnd;

            return {
                bookingId: slot.id,
                status,
                label: t(`booking.calendar.legend.${status}`),
                tooltip: `${slot.requesterName} - ${t(`booking.calendar.legend.${status}`)} - ${slot.safeReference}${slot.safePinAvailable ? ` - ${t('booking.calendar.safe_pin_available')}: ${slot.safePin}` : ''}`,
                startsAt: slot.start,
                endsAt: slot.end,
                requesterName: slot.requesterName,
                requesterEmail: slot.requesterEmail,
                groupId: slot.groupId,
                groupName: slot.groupId ? (groupNameById.value[String(slot.groupId)] ?? null) : null,
                safeReference: slot.safeReference,
                safePin: slot.safePin,
                safePinAvailable: slot.safePinAvailable,
                leftPct: (startMin / totalMinutes) * 100,
                widthPct: Math.max(((endMin - startMin) / totalMinutes) * 100, 0.5),
                lane,
                isStart,
                isEnd,
            };
        });

        return {
            segments,
            laneCount: Math.max(laneEndMinutes.length, 1),
        };
    }

    return {
        anchorDate,
        viewMode,
        searchQuery,
        visibleDates,
        slotsPerDay,
        timelineSlots,
        filteredCars,
        currentRangeLabel,
        setViewMode,
        goToPreviousRange,
        goToNextRange,
        goToToday,
        getCellMeta,
        getDayCellData,
        getRangeCellData,
    };
}

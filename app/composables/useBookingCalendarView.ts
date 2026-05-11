import type { Car } from '~/types';
import { useResourcesStore } from '~/stores/resources';

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
    distance: number;
    requesterNote: string | null;
    adminNote: string | null;
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
    distance: number;
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
    distance: number;
    requesterNote: string | null;
    adminNote: string | null;
    groupId: string | null;
    safeReference: string;
    safePin?: string;
    createdAt: string;
    updatedAt: string;
};

export type BookingCalendarRecord = CarBookingListItem;
export type BookingGroupOption = {
    id: string;
    name: string;
};
export type BookingCarOption = {
    id: string;
    name: string;
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

const VIEW_LENGTH: Record<Exclude<BookingCalendarViewMode, 'month'>, number> = {
    'day': 1,
    '3days': 3,
    'week': 7,
    '2weeks': 14,
};

const BOOKING_VIEW_MODES: BookingCalendarViewMode[] = ['day', '3days', 'week', '2weeks', 'month'];

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

function formatIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getInclusiveRangeLength(start: Date, end: Date): number {
    const startMs = normalizeDate(start).getTime();
    const endMs = normalizeDate(end).getTime();
    return Math.max(1, Math.floor((endMs - startMs) / 86400000) + 1);
}

function parseDateInput(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : normalizeDate(value);
    }

    if (typeof value === 'string') {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : normalizeDate(parsed);
    }

    return null;
}

function isBookingViewMode(value: string): value is BookingCalendarViewMode {
    return BOOKING_VIEW_MODES.includes(value as BookingCalendarViewMode);
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

function getClampedInterval(slot: BookingCalendarSlot, rangeStart: Date, rangeEnd: Date): { startMs: number; endMs: number } {
    const startMs = Math.max(slot.start.getTime(), rangeStart.getTime());
    const endMs = Math.min(slot.end.getTime(), rangeEnd.getTime());
    return { startMs, endMs };
}

function isAfterSafePinThreshold(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();
    return minutes >= (16 * 60 + 30);
}

function createLocalIsoLike(value: string): string {
    if (!value) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toISOString();
}

function createMockBookingId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `mock-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export function useBookingCalendarView() {
    const { t } = useI18n();
    const { formatDate, formatDateOnly, formatTimeOnly } = useGermanDateFormat();
    const resourcesStore = useResourcesStore();

    const today = normalizeDate(new Date());
    const anchorDate = ref<Date>(today);
    const customRange = ref<[Date, Date] | null>(null);
    const viewMode = ref<BookingCalendarViewMode>('day');
    const searchQuery = ref('');
    const showRejected = ref(false);
    const showCanceled = ref(false);

    const bookingRecords = shallowRef<CarBookingListItem[]>([]);
    const isBookingsRefreshInFlight = ref(false);
    const hasPendingBookingsRefresh = ref(false);
    const latestBookingsRequestId = ref(0);

    const cars = ref<BookingCalendarCar[]>([]);
    const groupNameById = computed<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        for (const g of resourcesStore.groups) {
            map[String(g.id)] = g.name;
        }
        return map;
    });
    const groupOptions = computed<BookingGroupOption[]>(() =>
        resourcesStore.groups.map(g => ({ id: String(g.id), name: g.name })),
    );
    const carOptions = computed<BookingCarOption[]>(() => {
        return cars.value.map(car => ({
            id: car.id,
            name: `${car.name} (${car.plateNumber})`,
        }));
    });

    const slots = computed<BookingCalendarSlot[]>(() => {
        const availableCarIds = cars.value.map(car => car.id);
        const fallbackCarBySourceCarId = new Map<string, string>();

        const mapped = bookingRecords.value.map((booking, index) => ({
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
            distance: booking.distance,
            requesterNote: booking.requesterNote,
            adminNote: booking.adminNote,
            groupId: booking.groupId,
            safeReference: booking.safeReference,
            safePin: booking.safePin ?? '',
            safePinAvailable: booking.status === 'APPROVED' && isAfterSafePinThreshold(new Date(booking.startsAt)),
        }));
        return mapped.filter((booking) => {
            if (booking.status === 'REJECTED' && !showRejected.value) return false;
            if (booking.status === 'CANCELED' && !showCanceled.value) return false;
            return true;
        });
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

    function getBookingById(bookingId: string): BookingCalendarRecord | null {
        return bookingRecords.value.find(item => item.id === bookingId) ?? null;
    }

    function upsertBookingRecord(booking: BookingCalendarRecord): BookingCalendarRecord {
        const normalized: BookingCalendarRecord = {
            ...booking,
            safePin: booking.safePin ?? '',
            requesterNote: booking.requesterNote ?? null,
            adminNote: booking.adminNote ?? null,
            distance: Number(booking.distance ?? 0),
        };
        const index = bookingRecords.value.findIndex(item => item.id === booking.id);
        if (index === -1) {
            bookingRecords.value = [normalized, ...bookingRecords.value];
        }
        else {
            const next = [...bookingRecords.value];
            next[index] = normalized;
            bookingRecords.value = next;
        }
        return normalized;
    }

    function removeBookingRecord(bookingId: string): void {
        bookingRecords.value = bookingRecords.value.filter(item => item.id !== bookingId);
    }

    async function updateBooking(bookingId: string, patch: Partial<Omit<BookingCalendarRecord, 'id'>> & { sendEmail?: boolean; email?: string }): Promise<BookingCalendarRecord | null> {
        const index = bookingRecords.value.findIndex(item => item.id === bookingId);
        if (index === -1) return null;

        const current = bookingRecords.value[index];
        if (!current) return null;
        const payload = {
            ...patch,
            startsAt: patch.startsAt ? createLocalIsoLike(patch.startsAt) : undefined,
            endsAt: patch.endsAt ? createLocalIsoLike(patch.endsAt) : undefined,
        };
        const response = await fetchDashboardApi<BookingCalendarRecord>(`/booking/car-bookings/${bookingId}`, {
            method: 'PATCH',
            body: payload,
        });
        const next = response.data ?? {
            ...current,
            ...patch,
            startsAt: patch.startsAt ? createLocalIsoLike(patch.startsAt) : current.startsAt,
            endsAt: patch.endsAt ? createLocalIsoLike(patch.endsAt) : current.endsAt,
            updatedAt: new Date().toISOString(),
        };
        return upsertBookingRecord(next);
    }

    async function changeBookingStatus(
        bookingId: string,
        status: BookingApiStatus,
        context?: {
            note?: string;
            sendEmail?: boolean;
            email?: string;
            safeReference?: string;
            safePin?: string;
        },
    ): Promise<BookingCalendarRecord | null> {
        return updateBooking(bookingId, {
            status,
            adminNote: context?.note,
            safeReference: context?.safeReference,
            safePin: context?.safePin,
            sendEmail: context?.sendEmail,
            email: context?.email,
        });
    }

    async function duplicateBooking(bookingId: string): Promise<BookingCalendarRecord | null> {
        const source = getBookingById(bookingId);
        if (!source) return null;

        const sourceStart = new Date(source.startsAt);
        const sourceEnd = new Date(source.endsAt);
        const durationMs = Math.max(sourceEnd.getTime() - sourceStart.getTime(), 30 * 60 * 1000);
        const nextStart = new Date(sourceEnd);
        const nextEnd = new Date(nextStart.getTime() + durationMs);
        const nowIso = new Date().toISOString();

        const payload: Partial<BookingCalendarRecord> = {
            ...source,
            startsAt: nextStart.toISOString(),
            endsAt: nextEnd.toISOString(),
            status: 'PENDING',
        };
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        const response = await fetchDashboardApi<BookingCalendarRecord>('/booking/car-bookings', {
            method: 'POST',
            body: payload,
        });
        if (!response.data) {
            const duplicate: BookingCalendarRecord = {
                ...(source as BookingCalendarRecord),
                id: createMockBookingId(),
                startsAt: nextStart.toISOString(),
                endsAt: nextEnd.toISOString(),
                status: 'PENDING',
                createdAt: nowIso,
                updatedAt: nowIso,
            };
            return upsertBookingRecord(duplicate);
        }
        return upsertBookingRecord(response.data);
    }

    async function cancelBooking(bookingId: string): Promise<BookingCalendarRecord | null> {
        return changeBookingStatus(bookingId, 'CANCELED');
    }

    async function createBooking(data: {
        carId: string;
        startsAt: string;
        endsAt: string;
        requesterName: string;
        requesterEmail: string;
        distance: number;
        status?: BookingApiStatus;
        requesterNote?: string | null;
        adminNote?: string | null;
        groupId?: string | null;
        safeReference?: string;
        safePin?: string;
        sendEmail?: boolean;
        email?: string;
    }): Promise<BookingCalendarRecord | null> {
        const response = await fetchDashboardApi<BookingCalendarRecord>('/booking/car-bookings', {
            method: 'POST',
            body: {
                ...data,
                startsAt: createLocalIsoLike(data.startsAt),
                endsAt: createLocalIsoLike(data.endsAt),
            },
        });
        if (!response.data) return null;
        return upsertBookingRecord(response.data);
    }

    async function deleteBooking(bookingId: string): Promise<void> {
        await fetchDashboardApi<{ success: boolean }>(`/booking/car-bookings/${bookingId}`, {
            method: 'DELETE',
        });
        removeBookingRecord(bookingId);
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

    const visibleDates = computed<Date[]>(() => {
        if (customRange.value) {
            const [rangeStart, rangeEnd] = customRange.value;
            return createDateRange(rangeStart, rangeEnd);
        }

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

    async function loadBookingsFromApi() {
        const requestId = latestBookingsRequestId.value + 1;
        latestBookingsRequestId.value = requestId;
        try {
            if (visibleDates.value.length === 0) return;
            const firstVisible = visibleDates.value[0];
            const lastVisible = visibleDates.value[visibleDates.value.length - 1];
            if (!firstVisible || !lastVisible) return;
            const startsFrom = new Date(normalizeDate(firstVisible));
            const endsBefore = new Date(normalizeDate(lastVisible));
            endsBefore.setDate(endsBefore.getDate() + 1);

            const aggregated: BookingCalendarRecord[] = [];
            let page = 1;
            let lastPage = 1;

            do {
                const response = await fetchDashboardApi<{
                    data: BookingCalendarRecord[];
                    meta: {
                        currentPage: number;
                        lastPage: number;
                    };
                }>('/booking/car-bookings', {
                    query: {
                        page,
                        length: 100,
                        sort_by: 'startsAt',
                        sort_dir: 'asc',
                        startsFrom: startsFrom.toISOString(),
                        endsBefore: endsBefore.toISOString(),
                    },
                });

                const payload = response.data;
                if (payload?.data?.length) {
                    aggregated.push(...payload.data);
                }
                lastPage = payload?.meta?.lastPage ?? 1;
                page += 1;
            } while (page <= lastPage);

            if (requestId === latestBookingsRequestId.value) {
                bookingRecords.value = aggregated;
            }
        }
        catch (error) {
            console.error('Failed to load booking records:', error);
        }
    }

    async function refreshBookings() {
        if (isBookingsRefreshInFlight.value) {
            hasPendingBookingsRefresh.value = true;
            return;
        }

        isBookingsRefreshInFlight.value = true;
        try {
            await loadBookingsFromApi();
        }
        finally {
            isBookingsRefreshInFlight.value = false;
            if (hasPendingBookingsRefresh.value) {
                hasPendingBookingsRefresh.value = false;
                await refreshBookings();
            }
        }
    }

    function getVisibleRangeBounds(): { startsFrom: Date; endsBefore: Date } | null {
        if (visibleDates.value.length === 0) return null;
        const firstVisible = visibleDates.value[0];
        const lastVisible = visibleDates.value[visibleDates.value.length - 1];
        if (!firstVisible || !lastVisible) return null;
        const startsFrom = normalizeDate(firstVisible);
        const endsBefore = addDays(normalizeDate(lastVisible), 1);
        return { startsFrom, endsBefore };
    }

    function isBookingWithinVisibleRange(startsAt: string, endsAt: string): boolean {
        const bounds = getVisibleRangeBounds();
        if (!bounds) return false;
        const start = new Date(startsAt);
        const end = new Date(endsAt);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
        return intervalsOverlap(start, end, bounds.startsFrom, bounds.endsBefore);
    }

    function passesStatusVisibility(status: BookingApiStatus): boolean {
        if (status === 'REJECTED' && !showRejected.value) return false;
        if (status === 'CANCELED' && !showCanceled.value) return false;
        return true;
    }

    onMounted(() => {
        loadCarsFromIndex();
        if (import.meta.client && resourcesStore.groups.length === 0) {
            void resourcesStore.fetchAdminData(true);
        }
        loadBookingsFromApi();
    });

    watch(
        () => [
            visibleDates.value[0]?.toISOString() ?? '',
            visibleDates.value[visibleDates.value.length - 1]?.toISOString() ?? '',
        ],
        () => {
            loadBookingsFromApi();
        },
    );

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
        if (!first || !last) return '';
        if (first.getTime() === last.getTime()) {
            return formatDateOnly(first);
        }
        return `${formatDateOnly(first)} - ${formatDateOnly(last)}`;
    });

    const selectedDateRange = computed<string | [string, string] | null>({
        get(): string | [string, string] | null {
            const dates = visibleDates.value;
            if (!dates.length) return null;
            const start = dates[0];
            const end = dates[dates.length - 1];
            if (!start || !end) return null;
            if (viewMode.value === 'day') {
                return formatIsoDate(start);
            }
            return [formatIsoDate(start), formatIsoDate(end)] as [string, string];
        },
        set(nextValue: string | [string, string] | string[] | null | undefined) {
            if (viewMode.value === 'day') {
                if (typeof nextValue === 'string' && nextValue.length > 0) {
                    const parsedDate = parseDateInput(nextValue);
                    if (parsedDate) {
                        customRange.value = [parsedDate, parsedDate];
                        anchorDate.value = parsedDate;
                        return;
                    }
                }
                if (Array.isArray(nextValue) && nextValue.length > 0) {
                    const parsedDate = parseDateInput(nextValue[0]);
                    if (parsedDate) {
                        customRange.value = [parsedDate, parsedDate];
                        anchorDate.value = parsedDate;
                        return;
                    }
                }
                const todayDate = normalizeDate(new Date());
                customRange.value = [todayDate, todayDate];
                anchorDate.value = todayDate;
                return;
            }

            if (!Array.isArray(nextValue) || nextValue.length < 2) {
                customRange.value = null;
                return;
            }

            const parsedStart = parseDateInput(nextValue[0]);
            const parsedEnd = parseDateInput(nextValue[1]);
            if (!parsedStart || !parsedEnd) {
                customRange.value = null;
                return;
            }

            const rangeStart = parsedStart <= parsedEnd ? parsedStart : parsedEnd;
            const rangeEnd = parsedStart <= parsedEnd ? parsedEnd : parsedStart;

            customRange.value = [rangeStart, rangeEnd];
            anchorDate.value = rangeStart;
        },
    });

    function setViewMode(mode: BookingCalendarViewMode) {
        customRange.value = null;
        viewMode.value = mode;
        if (mode === 'day') {
            anchorDate.value = normalizeDate(new Date());
            return;
        }
        if (mode === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth(), 1);
        }
    }

    function setViewModeFromQuery(mode: string | null): BookingCalendarViewMode {
        const nextMode = (mode && isBookingViewMode(mode)) ? mode : 'day';
        setViewMode(nextMode);
        return nextMode;
    }

    function setSelectedDateRangeFromQuery(start: string | null, end: string | null): boolean {
        if (!start || !end) {
            customRange.value = null;
            return false;
        }

        const parsedStart = parseDateInput(start);
        const parsedEnd = parseDateInput(end);

        if (!parsedStart || !parsedEnd) {
            customRange.value = null;
            return false;
        }

        const rangeStart = parsedStart <= parsedEnd ? parsedStart : parsedEnd;
        const rangeEnd = parsedStart <= parsedEnd ? parsedEnd : parsedStart;
        customRange.value = [rangeStart, rangeEnd];
        anchorDate.value = rangeStart;
        return true;
    }

    function setSelectedDateFromQuery(date: string | null): boolean {
        if (!date) {
            const todayDate = normalizeDate(new Date());
            customRange.value = [todayDate, todayDate];
            anchorDate.value = todayDate;
            return false;
        }

        const parsedDate = parseDateInput(date);
        if (!parsedDate) {
            const todayDate = normalizeDate(new Date());
            customRange.value = [todayDate, todayDate];
            anchorDate.value = todayDate;
            return false;
        }

        customRange.value = [parsedDate, parsedDate];
        anchorDate.value = parsedDate;
        return true;
    }

    function goToPreviousRange() {
        if (customRange.value) {
            const [rangeStart, rangeEnd] = customRange.value;
            const rangeLength = getInclusiveRangeLength(rangeStart, rangeEnd);
            customRange.value = [
                addDays(rangeStart, -rangeLength),
                addDays(rangeEnd, -rangeLength),
            ];
            return;
        }

        if (viewMode.value === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth() - 1, 1);
            return;
        }
        anchorDate.value = addDays(anchorDate.value, -VIEW_LENGTH[viewMode.value]);
    }

    function goToNextRange() {
        if (customRange.value) {
            const [rangeStart, rangeEnd] = customRange.value;
            const rangeLength = getInclusiveRangeLength(rangeStart, rangeEnd);
            customRange.value = [
                addDays(rangeStart, rangeLength),
                addDays(rangeEnd, rangeLength),
            ];
            return;
        }

        if (viewMode.value === 'month') {
            const current = normalizeDate(anchorDate.value);
            anchorDate.value = new Date(current.getFullYear(), current.getMonth() + 1, 1);
            return;
        }
        anchorDate.value = addDays(anchorDate.value, VIEW_LENGTH[viewMode.value]);
    }

    function goToToday() {
        if (customRange.value) {
            const [rangeStart, rangeEnd] = customRange.value;
            const rangeLength = getInclusiveRangeLength(rangeStart, rangeEnd);
            const nextStart = normalizeDate(new Date());
            customRange.value = [nextStart, addDays(nextStart, rangeLength - 1)];
            return;
        }

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
        const dominantBooking = matchedSlots.find(item => item.status === dominantStatus) ?? matchedSlots[0]!;
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

        const rangeStart = normalizeDate(visibleDates.value[0] ?? dayStart);
        const rangeEnd = new Date(normalizeDate(visibleDates.value[visibleDates.value.length - 1] ?? dayStart));
        rangeEnd.setDate(rangeEnd.getDate() + 1);

        const rangeSource = slots.value
            .filter(slot => slot.carId === carId && intervalsOverlap(slot.start, slot.end, rangeStart, rangeEnd))
            .sort((a, b) => {
                const startDiff = a.start.getTime() - b.start.getTime();
                if (startDiff !== 0) return startDiff;
                const endDiff = b.end.getTime() - a.end.getTime();
                if (endDiff !== 0) return endDiff;
                return a.id.localeCompare(b.id);
            });

        const laneEndMs: number[] = [];
        const laneByBookingId = new Map<string, number>();
        for (const slot of rangeSource) {
            const { startMs, endMs } = getClampedInterval(slot, rangeStart, rangeEnd);
            let lane = laneEndMs.findIndex(end => startMs >= end);
            if (lane === -1) {
                lane = laneEndMs.length;
                laneEndMs.push(endMs);
            }
            else {
                laneEndMs[lane] = endMs;
            }
            laneByBookingId.set(slot.id, lane);
        }

        const source = rangeSource.filter(slot => intervalsOverlap(slot.start, slot.end, dayStart, dayEnd));
        const segments: BookingDaySegment[] = source.map((slot) => {
            const segmentStart = slot.start > dayStart ? slot.start : dayStart;
            const segmentEnd = slot.end < dayEnd ? slot.end : dayEnd;

            const startMin = Math.max(0, (segmentStart.getTime() - dayStart.getTime()) / 60000);
            const endMin = Math.min(1440, (segmentEnd.getTime() - dayStart.getTime()) / 60000);
            const lane = laneByBookingId.get(slot.id) ?? 0;

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
                distance: slot.distance,
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
            laneCount: Math.max(...segments.map(segment => segment.lane + 1), 1),
        };
    }

    function getRangeCellData(carId: string): BookingRangeCellData {
        if (visibleDates.value.length === 0) {
            return { segments: [], laneCount: 1 };
        }

        const firstRange = visibleDates.value[0];
        const lastRange = visibleDates.value[visibleDates.value.length - 1];
        if (!firstRange || !lastRange) {
            return { segments: [], laneCount: 1 };
        }

        const rangeStart = normalizeDate(firstRange);
        const rangeEnd = new Date(normalizeDate(lastRange));
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
                distance: slot.distance,
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
        showRejected,
        showCanceled,
        visibleDates,
        slotsPerDay,
        timelineSlots,
        filteredCars,
        currentRangeLabel,
        selectedDateRange,
        setViewModeFromQuery,
        setSelectedDateFromQuery,
        setSelectedDateRangeFromQuery,
        setViewMode,
        goToPreviousRange,
        goToNextRange,
        goToToday,
        getCellMeta,
        getDayCellData,
        getRangeCellData,
        getBookingById,
        createBooking,
        updateBooking,
        changeBookingStatus,
        duplicateBooking,
        cancelBooking,
        deleteBooking,
        refreshBookings,
        upsertBookingRecord,
        removeBookingRecord,
        isBookingWithinVisibleRange,
        passesStatusVisibility,
        groupOptions,
        carOptions,
    };
}

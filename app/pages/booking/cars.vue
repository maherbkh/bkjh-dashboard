<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const pageIcon = usePageIcon();
const route = useRoute();
const router = useRouter();

const pageTitle = computed(() => t('booking.cars_booking.title'));
const pageDescription = computed(() => t('booking.cars_booking.description'));
const isCalendarFullscreen = ref(false);
const userStore = useUserStore();
const runtimeConfig = useRuntimeConfig();

const FALLBACK_REFRESH_THROTTLE_MS = 2000;
let fallbackRefreshTimeout: ReturnType<typeof setTimeout> | null = null;
const {
    viewMode,
    searchQuery,
    showRejected,
    showCanceled,
    visibleDates,
    filteredCars,
    selectedDateRange,
    setViewModeFromQuery,
    setSelectedDateFromQuery,
    setSelectedDateRangeFromQuery,
    setViewMode,
    goToPreviousRange,
    goToNextRange,
    goToToday,
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
} = useBookingCalendarView();

const {
    currentAction,
    isDialogOpen,
    selectedBooking,
    pendingStatus,
    statusNote,
    sendEmail,
    emailOption,
    customEmails,
    emailError,
    showSafeFields,
    allowEditCar,
    shouldAutoShowSafeFields,
    isInternalEmail: checkInternalEmail,
    statusOptions,
    editForm,
    isSubmitting,
    openAction,
    closeDialog,
    confirmAction,
} = useBookingActions({
    getBookingById,
    createBooking,
    updateBooking,
    changeBookingStatus,
    duplicateBooking,
    cancelBooking,
    deleteBooking,
});

const isRequesterInternalEmail = computed(() => {
    if (typeof checkInternalEmail !== 'function') return false;
    return checkInternalEmail(selectedBooking.value?.requesterEmail);
});

const isSyncingQuery = ref(false);

function toggleCalendarFullscreen() {
    isCalendarFullscreen.value = !isCalendarFullscreen.value;
}

function onEscapeFullscreen(event: KeyboardEvent) {
    if (event.key === 'Escape' && isCalendarFullscreen.value) {
        isCalendarFullscreen.value = false;
    }
}

function clearFallbackRefreshTimeout() {
    if (!fallbackRefreshTimeout) return;
    clearTimeout(fallbackRefreshTimeout);
    fallbackRefreshTimeout = null;
}

function scheduleFallbackRefresh() {
    if (fallbackRefreshTimeout) return;
    fallbackRefreshTimeout = setTimeout(async () => {
        fallbackRefreshTimeout = null;
        await refreshBookings();
    }, FALLBACK_REFRESH_THROTTLE_MS);
}

const {
    connect: connectRealtime,
    stop: stopRealtime,
    startEditing,
    stopEditing,
    editorsOf,
} = useBookingRealtime(
    {
        getSocketUrl: () => {
            const raw = String(runtimeConfig.public.websocketBaseUrl || window.location.origin).replace(/\/+$/, '');
            return raw.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://') + '/dashboard-realtime';
        },
        getToken: () => userStore.accessToken ?? undefined,
    },
    {
        onCreated: (record) => {
            upsertBookingRecord(record);
            const visible = passesStatusVisibility(record.status)
                && isBookingWithinVisibleRange(record.startsAt, record.endsAt);
            if (!visible) scheduleFallbackRefresh();
        },
        onUpdated: upsertBookingRecord,
        onDeleted: removeBookingRecord,
        onInvalidPayload: scheduleFallbackRefresh,
    },
);

// Presence — editors currently viewing/editing the selected booking
const currentEditors = computed(() => {
    if (!selectedBooking.value) return [];
    return editorsOf(selectedBooking.value.id);
});

function onAddNew() {
    onOpenAction({ action: 'create' });
}

// Only emit booking:edit-start for actions that involve modifying the record.
// 'duplicate' and 'cancel' are immediate one-shot operations, not collaborative edits.
const EDITING_ACTIONS = new Set<string>(['edit', 'change_status']);

// Whether THIS admin opened the dialog while another admin already had it open.
// Captured as a snapshot at open time — not reactive — so the first editor is never
// locked out after a second person joins mid-session.
const isBookingLockedByOther = ref(false);

function onOpenAction(selection: Parameters<typeof openAction>[0]) {
    openAction(selection);
    if (selection.bookingId && EDITING_ACTIONS.has(selection.action)) {
        // Snapshot the editor list BEFORE emitting edit-start so we can decide
        // whether this admin is the primary editor or a read-only viewer.
        const otherEditorsNow = editorsOf(selection.bookingId)
            .filter(e => e.adminId !== userStore.user?.id);
        isBookingLockedByOther.value = otherEditorsNow.length > 0;
        // Only claim editing presence if no one else is already editing.
        // Read-only viewers don't emit edit-start so they don't appear in the banner.
        if (!isBookingLockedByOther.value) {
            startEditing(selection.bookingId);
        }
    }
    else {
        isBookingLockedByOther.value = false;
    }
}

function onCloseDialog() {
    // Capture before closeDialog() resets dialog state
    const bookingId = selectedBooking.value?.id;
    const action = currentAction.value;
    const wasEditor = !isBookingLockedByOther.value;
    closeDialog();
    isBookingLockedByOther.value = false;
    if (bookingId && action && EDITING_ACTIONS.has(action) && wasEditor) {
        stopEditing(bookingId);
    }
}

async function onConfirmAction() {
    // Capture before confirmAction() calls closeDialog() in its finally block
    const bookingId = selectedBooking.value?.id;
    const action = currentAction.value;
    const wasEditor = !isBookingLockedByOther.value;
    await confirmAction();
    isBookingLockedByOther.value = false;
    if (bookingId && action && EDITING_ACTIONS.has(action) && wasEditor) {
        stopEditing(bookingId);
    }
}

watch(
    () => userStore.accessToken,
    (token) => {
        if (!token) {
            stopRealtime();
            return;
        }
        void connectRealtime();
    },
    { immediate: true },
);

onMounted(() => {
    window.addEventListener('keydown', onEscapeFullscreen);
    hydrateCalendarStateFromQuery();
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onEscapeFullscreen);
    // leave() is called automatically by useBookingRealtime's onUnmounted hook.
    // stopRealtime() is only called on logout via the token watcher above.
    clearFallbackRefreshTimeout();
});

function getSingleQueryParam(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) return value[0] ?? null;
    return typeof value === 'string' ? value : null;
}

function parseBooleanQuery(value: string | null, defaultValue: boolean): boolean {
    if (value === null) return defaultValue;
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    return defaultValue;
}

function onUpdateViewMode(...args: unknown[]) {
    const value = args[0];
    if (value === 'day' || value === '3days' || value === 'week' || value === '2weeks' || value === 'month') {
        setViewMode(value);
    }
}

function hydrateCalendarStateFromQuery() {
    isSyncingQuery.value = true;
    try {
        const mode = getSingleQueryParam(route.query.view as string | string[] | undefined);
        const start = getSingleQueryParam(route.query.start as string | string[] | undefined);
        const end = getSingleQueryParam(route.query.end as string | string[] | undefined);
        const rejected = getSingleQueryParam(route.query.rejected as string | string[] | undefined);
        const canceled = getSingleQueryParam(route.query.canceled as string | string[] | undefined);
        const appliedMode = setViewModeFromQuery(mode);
        if (appliedMode === 'day') {
            setSelectedDateFromQuery(start);
        }
        else {
            setSelectedDateRangeFromQuery(start, end);
        }
        showRejected.value = parseBooleanQuery(rejected, true);
        showCanceled.value = parseBooleanQuery(canceled, true);
    }
    finally {
        isSyncingQuery.value = false;
    }
}

function buildNextQuery() {
    const nextQuery: Record<string, string> = {};

    Object.entries(route.query).forEach(([key, value]) => {
        if (key === 'view' || key === 'start' || key === 'end') return;
        if (typeof value === 'string') nextQuery[key] = value;
        else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') nextQuery[key] = value[0];
    });

    nextQuery.view = viewMode.value;
    nextQuery.rejected = showRejected.value ? '1' : '0';
    nextQuery.canceled = showCanceled.value ? '1' : '0';

    if (typeof selectedDateRange.value === 'string' && selectedDateRange.value.length > 0) {
        nextQuery.start = selectedDateRange.value;
    }
    else if (Array.isArray(selectedDateRange.value) && selectedDateRange.value.length === 2) {
        const [start, end] = selectedDateRange.value;
        if (start && end) {
            nextQuery.start = start;
            nextQuery.end = end;
        }
    }

    return nextQuery;
}

async function syncCalendarStateToQuery() {
    if (isSyncingQuery.value) return;
    const nextQuery = buildNextQuery();
    const currentView = getSingleQueryParam(route.query.view as string | string[] | undefined);
    const currentStart = getSingleQueryParam(route.query.start as string | string[] | undefined);
    const currentEnd = getSingleQueryParam(route.query.end as string | string[] | undefined);
    const currentRejected = getSingleQueryParam(route.query.rejected as string | string[] | undefined);
    const currentCanceled = getSingleQueryParam(route.query.canceled as string | string[] | undefined);

    if (nextQuery.view === currentView
        && (nextQuery.start ?? null) === currentStart
        && (nextQuery.end ?? null) === currentEnd
        && nextQuery.rejected === (currentRejected ?? '1')
        && nextQuery.canceled === (currentCanceled ?? '1')) {
        return;
    }

    isSyncingQuery.value = true;
    try {
        await router.replace({ query: nextQuery });
    }
    finally {
        isSyncingQuery.value = false;
    }
}

watch(
    [viewMode, selectedDateRange, showRejected, showCanceled],
    () => {
        syncCalendarStateToQuery();
        refreshBookings();
    },
    { deep: true },
);

watch(
    () => route.query,
    () => {
        if (isSyncingQuery.value) return;
        hydrateCalendarStateFromQuery();
    },
);

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});
</script>

<template>
    <div class="flex flex-col gap-4 min-w-0 overflow-x-hidden">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'mingcute:car-3-line'"
            :has-add-new="true"
            :has-deleted-items="false"
            @add-new="onAddNew"
        />

        <div
            :class="[
                'flex flex-col gap-4 min-w-0 overflow-x-hidden',
                isCalendarFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-y-auto overflow-x-hidden' : '',
            ]"
        >
            <BookingCalendarToolbar
                :search-query="searchQuery"
                :view-mode="viewMode"
                :selected-range="selectedDateRange"
                :show-rejected="showRejected"
                :show-canceled="showCanceled"
                :is-fullscreen="isCalendarFullscreen"
                @update:search-query="searchQuery = $event"
                @update:view-mode="onUpdateViewMode"
                @update:selected-range="selectedDateRange = $event"
                @update:show-rejected="showRejected = $event"
                @update:show-canceled="showCanceled = $event"
                @go-prev="goToPreviousRange"
                @go-next="goToNextRange"
                @go-today="goToToday"
                @toggle-fullscreen="toggleCalendarFullscreen"
            />

            <BookingCalendarLegend />

            <BookingCalendarGrid
                :cars="filteredCars"
                :visible-dates="visibleDates"
                :view-mode="viewMode"
                :get-day-cell-data="getDayCellData"
                :get-range-cell-data="getRangeCellData"
                @select-action="onOpenAction"
            />

            <div class="w-full px-4 py-3 lg:px-16">
                <div class="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        @click="goToPreviousRange"
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
                        @click="goToToday"
                    >
                        {{ $t('booking.calendar.actions.today') }}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        @click="goToNextRange"
                    >
                        {{ $t('booking.calendar.actions.next') }}
                        <Icon
                            name="solar:alt-arrow-right-linear"
                            class="size-4"
                        />
                    </Button>
                </div>
            </div>

            <BookingActionDialog
                :open="isDialogOpen"
                :action="currentAction"
                :booking="selectedBooking"
                :status-options="statusOptions"
                :group-options="groupOptions"
                :car-options="carOptions"
                :pending-status="pendingStatus"
                :status-note="statusNote"
                :send-email="sendEmail"
                :email-option="emailOption"
                :custom-emails="customEmails"
                :email-error="emailError"
                :show-safe-fields="showSafeFields"
                :allow-edit-car="allowEditCar"
                :should-auto-show-safe-fields="shouldAutoShowSafeFields"
                :is-internal-email="isRequesterInternalEmail"
                :edit-form="editForm"
                :is-submitting="isSubmitting"
                :editors="currentEditors"
                :current-admin-id="userStore.user?.id"
                @update:open="(value: boolean) => value ? null : onCloseDialog()"
                @update:pending-status="pendingStatus = $event"
                @update:status-note="statusNote = $event"
                @update:send-email="sendEmail = $event"
                @update:email-option="emailOption = $event"
                @update:custom-emails="customEmails = $event"
                @update:show-safe-fields="showSafeFields = $event"
                @update:allow-edit-car="allowEditCar = $event"
                @update:edit-form="editForm = $event"
                @confirm="onConfirmAction"
            />
        </div>
    </div>
</template>

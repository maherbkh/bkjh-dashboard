<script setup lang="ts">
const { t } = useI18n();
const pageIcon = usePageIcon();

const pageTitle = computed(() => t('booking.cars_booking.title'));
const pageDescription = computed(() => t('booking.cars_booking.description'));
const isCalendarFullscreen = ref(false);
const {
    viewMode,
    searchQuery,
    visibleDates,
    filteredCars,
    currentRangeLabel,
    setViewMode,
    goToPreviousRange,
    goToNextRange,
    goToToday,
    getDayCellData,
    getRangeCellData,
} = useBookingCalendarView();

function toggleCalendarFullscreen() {
    isCalendarFullscreen.value = !isCalendarFullscreen.value;
}

function onEscapeFullscreen(event: KeyboardEvent) {
    if (event.key === 'Escape' && isCalendarFullscreen.value) {
        isCalendarFullscreen.value = false;
    }
}

onMounted(() => {
    window.addEventListener('keydown', onEscapeFullscreen);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onEscapeFullscreen);
});

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
    <div class="flex flex-col gap-4">
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'mingcute:car-3-line'"
            :has-add-new="false"
            :has-deleted-items="false"
        />

        <div
            :class="[
                'flex flex-col gap-4',
                isCalendarFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : '',
            ]"
        >
            <BookingCalendarToolbar
                :search-query="searchQuery"
                :view-mode="viewMode"
                :range-label="currentRangeLabel"
                :is-fullscreen="isCalendarFullscreen"
                @update:search-query="searchQuery = $event"
                @update:view-mode="setViewMode"
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
            />
        </div>
    </div>
</template>

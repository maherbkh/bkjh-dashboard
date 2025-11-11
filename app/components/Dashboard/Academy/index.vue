<template>
    <div class="flex flex-col gap-6">
        <!-- Loading State -->
        <template v-if="pending">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="bg-muted/50 px-4 py-3 rounded-2xl border border-border/50"
                >
                    <Skeleton class="h-4 w-20 mb-2" />
                    <Skeleton class="h-8 w-16 mb-2" />
                    <Skeleton class="h-3 w-24" />
                </div>
            </div>
        </template>

        <!-- Error State -->
        <template v-else-if="error">
            <div class="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                <p class="text-destructive font-medium">{{ t('common.error.loading_failed') }}</p>
                <p class="text-sm text-muted-foreground mt-2">
                    {{ error?.message || error?.data?.message || t('common.error.generic') }}
                </p>
            </div>
        </template>

        <!-- Data Display -->
        <template v-else-if="statsData">
            <!-- Row 1: Counts with Icons -->
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <DashboardAcademyStateBox
                    :title="t('academy.dashboard.upcoming_events')"
                    title-icon="solar:calendar-mark-bold"
                    :value="statsData.counts.upcomingEvents"
                />
                <DashboardAcademyStateBox
                    :title="t('academy.dashboard.pending_registrations')"
                    title-icon="solar:clock-circle-bold"
                    :value="statsData.counts.pendingEventRegistrations"
                />
                <DashboardAcademyStateBox
                    :title="t('academy.dashboard.total_attendees')"
                    title-icon="solar:users-group-two-rounded-bold"
                    :value="statsData.counts.totalAttendees"
                />
            </div>

            <!-- Row 2-4: Charts and Metrics - Responsive Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <!-- Line Chart - spans 2 columns on lg+ -->
                <div class="lg:col-span-12">
                    <DashboardAcademyLineChartCard
                        :title="t('academy.dashboard.event_registrations_by_attendee_type')"
                        title-icon="solar:graph-up-bold"
                        :description="t('academy.dashboard.event_registrations_by_attendee_type_description')"
                        :data="eventRegistrationsByAttendeeTypeData"
                        index-key="month"
                        :categories="['employee', 'nonEmployee']"
                        :colors="chartColors2"
                        :margin="{ top: 10, bottom: 40, left: 50, right: 20 }"
                        :category-labels="{
                            'employee': t('academy.dashboard.employee'),
                            'nonEmployee': t('academy.dashboard.non_employee')
                        }"
                    />
                </div>

                <!-- Bar Chart - Top Categories - spans 2 columns on lg+ -->
                <div class="lg:col-span-6">
                    <DashboardAcademyBarChartCard
                        :title="t('academy.dashboard.top_categories_by_registrations')"
                        title-icon="solar:chart-2-bold"
                        :description="t('academy.dashboard.top_categories_by_registrations_description')"
                        :data="topCategoriesByRegistrationsData"
                        index-key="category"
                        :categories="['pending', 'approved', 'rejected']"
                        :colors="chartColors"
                        type="grouped"
                        :margin="{ top: 10, bottom: 40, left: 50, right: 20 }"
                        :x-formatter="categoryXFormatter"
                        :category-labels="{
                            'pending': t('academy.dashboard.pending'),
                            'approved': t('academy.dashboard.approved'),
                            'rejected': t('academy.dashboard.rejected')
                        }"
                    />
                </div>

                <!-- Bar Chart - Top Targets - spans 2 columns on lg+ -->
                <div class="lg:col-span-6">
                    <DashboardAcademyBarChartCard
                        :title="t('academy.dashboard.top_event_targets_by_registrations')"
                        title-icon="solar:target-bold"
                        :description="t('academy.dashboard.top_event_targets_by_registrations_description')"
                        :data="topEventTargetsByRegistrationsData"
                        index-key="eventTarget"
                        :categories="['pending', 'approved', 'rejected']"
                        :colors="chartColors"
                        type="grouped"
                        :margin="{ top: 10, bottom: 40, left: 50, right: 20 }"
                        :x-formatter="targetXFormatter"
                        :category-labels="{
                            'pending': t('academy.dashboard.pending'),
                            'approved': t('academy.dashboard.approved'),
                            'rejected': t('academy.dashboard.rejected')
                        }"
                    />
                </div>
                
            </div>
            
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useApiFetch } from '~/composables/useApiFetch';
import type { OverviewStatsResponse, OverviewStatsData } from '~/types/academy';
import { Skeleton } from '~/components/ui/skeleton';

const { t } = useI18n();

// Fetch data from API
const { data, pending, error } = useApiFetch<OverviewStatsResponse>('/academy/overview/stats');

const statsData = computed(() => data.value?.data as OverviewStatsData | undefined);


// Helper function to get CSS variable color value (resolves nested variables recursively)
const getCssVarColor = (varName: string, fallback: string, visited = new Set<string>()): string => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    
    // Prevent infinite loops
    if (visited.has(varName)) {
        return fallback;
    }
    visited.add(varName);
    
    const root = getComputedStyle(document.documentElement);
    let value = root.getPropertyValue(varName).trim();
    
    if (!value) {
        return fallback;
    }
    
    // If the value is a var() reference, resolve it recursively
    if (value.startsWith('var(')) {
        const varMatch = value.match(/var\(([^)]+)\)/);
        if (varMatch && varMatch[1]) {
            const nestedVarName = varMatch[1].trim();
            // Recursively resolve the nested variable
            return getCssVarColor(nestedVarName, fallback, visited);
        }
    }
    
    return value || fallback;
};

// Chart colors - reading from chart CSS variables
// pending = secondary (chart-2), approved = success (chart-3), rejected = destructive (chart-5)
const chartColors = computed(() => [
    getCssVarColor('--chart-2', 'oklch(0.6 0.118 184.704)'), // pending - secondary
    getCssVarColor('--chart-3', 'oklch(0.398 0.07 227.392)'), // approved - success
    getCssVarColor('--chart-5', 'oklch(0.769 0.188 70.08)')  // rejected - destructive
]);

const chartColors2 = computed(() => [
    getCssVarColor('--chart-1', 'oklch(0.646 0.222 41.116)'),
    getCssVarColor('--chart-2', 'oklch(0.6 0.118 184.704)')
]);

// Helper function to truncate long text for chart labels
const truncateLabel = (text: string, maxLength: number = 12): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

// Computed properties for chart data transformations
const eventRegistrationsByAttendeeTypeData = computed(() => {
    if (!statsData.value) return [];
    return statsData.value.eventRegistrationsByAttendeeType as any[];
});

const topCategoriesByRegistrationsData = computed(() => {
    if (!statsData.value) return [];
    return statsData.value.topCategoriesByEventRegistrations.map(cat => ({
        category: cat.category,
        pending: cat.pending,
        approved: cat.approved,
        rejected: cat.rejected
    }));
});

const topEventTargetsByRegistrationsData = computed(() => {
    if (!statsData.value) return [];
    return statsData.value.topEventTargetsByRegistrations.map(target => ({
        eventTarget: target.eventTarget,
        pending: target.pending,
        approved: target.approved,
        rejected: target.rejected
    }));
});

// X-axis formatters for truncating long labels
const categoryXFormatter = (tick: number | Date, i: number, ticks: number[] | Date[]): string => {
    if (typeof tick !== 'number') return '';
    if (!statsData.value?.topCategoriesByEventRegistrations) return '';
    const category = statsData.value.topCategoriesByEventRegistrations[tick]?.category || '';
    return truncateLabel(category, 12);
};

const targetXFormatter = (tick: number | Date, i: number, ticks: number[] | Date[]): string => {
    if (typeof tick !== 'number') return '';
    if (!statsData.value?.topEventTargetsByRegistrations) return '';
    const target = statsData.value.topEventTargetsByRegistrations[tick]?.eventTarget || '';
    return truncateLabel(target, 12);
};

</script>

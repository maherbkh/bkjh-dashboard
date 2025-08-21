<script setup lang="ts">
import type { EventData } from '~/types';

interface Props {
    events: EventData[];
    viewMode?: 'grid' | 'list' | 'month' | 'week' | 'day';
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    viewMode: 'grid',
    loading: false,
});

const emit = defineEmits<{
    eventClick: [event: EventData];
    viewModeChange: [mode: string];
}>();

const handleEventClick = (event: EventData) => {
    emit('eventClick', event);
};

const handleViewModeChange = (mode: string) => {
    emit('viewModeChange', mode);
};
</script>

<template>
    <div class="space-y-6">
        <!-- View Mode Selector -->
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold tracking-tight">
                {{ $t('academy.events.title') }}
            </h2>
            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': viewMode === 'grid' }"
                    @click="handleViewModeChange('grid')"
                >
                    <Icon
                        name="lucide:grid-3x3"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': viewMode === 'list' }"
                    @click="handleViewModeChange('list')"
                >
                    <Icon
                        name="lucide:list"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': viewMode === 'month' }"
                    @click="handleViewModeChange('month')"
                >
                    <Icon
                        name="lucide:calendar"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': viewMode === 'week' }"
                    @click="handleViewModeChange('week')"
                >
                    <Icon
                        name="lucide:calendar-days"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    :class="{ 'bg-primary text-primary-foreground': viewMode === 'day' }"
                    @click="handleViewModeChange('day')"
                >
                    <Icon
                        name="lucide:calendar-clock"
                        class="h-4 w-4"
                    />
                </Button>
            </div>
        </div>

        <!-- Content Area -->
        <div class="min-h-[400px]">
            <!-- Loading State -->
            <div
                v-if="loading"
                class="space-y-4"
            >
                <div
                    v-for="i in 6"
                    :key="i"
                    class="animate-pulse"
                >
                    <div class="h-48 bg-muted rounded-lg" />
                </div>
            </div>

            <!-- Grid View -->
            <EventCardGrid
                v-else-if="viewMode === 'grid'"
                :events="events"
                @event-click="handleEventClick"
            />

            <!-- List View -->
            <EventList
                v-else-if="viewMode === 'list'"
                :events="events"
                @event-click="handleEventClick"
            />

            <!-- Month View -->
            <EventMonth
                v-else-if="viewMode === 'month'"
                :events="events"
                @event-click="handleEventClick"
            />

            <!-- Week View -->
            <EventWeek
                v-else-if="viewMode === 'week'"
                :events="events"
                @event-click="handleEventClick"
            />

            <!-- Day View -->
            <EventDay
                v-else-if="viewMode === 'day'"
                :events="events"
                @event-click="handleEventClick"
            />

            <!-- Empty State -->
            <div
                v-if="!loading && events.length === 0"
                class="text-center py-12"
            >
                <Icon
                    name="lucide:calendar-x"
                    class="h-12 w-12 text-muted-foreground mx-auto mb-4"
                />
                <h3 class="text-lg font-semibold text-muted-foreground mb-2">
                    {{ $t('academy.events.no_events') }}
                </h3>
                <p class="text-muted-foreground">
                    {{ $t('academy.events.no_events_description') }}
                </p>
            </div>
        </div>
    </div>
</template>

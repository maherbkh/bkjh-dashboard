<script setup lang="ts">
import type { EventData } from '~/types';

interface Props {
    events: EventData[];
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const emit = defineEmits<{
    eventClick: [event: EventData];
}>();

const handleEventClick = (event: EventData) => {
    emit('eventClick', event);
};
</script>

<template>
    <div class="w-full">
        <!-- Loading State -->
        <div
            v-if="loading"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
            <div
                v-for="i in 8"
                :key="i"
                class="animate-pulse"
            >
                <div class="bg-muted rounded-lg h-80" />
            </div>
        </div>

        <!-- Events Grid -->
        <div
            v-else-if="events.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
            <EventCard
                v-for="event in events"
                :key="event.id"
                :event-item="event"
                @click="handleEventClick"
            />
        </div>

        <!-- Empty State -->
        <div
            v-else
            class="text-center py-12"
        >
            <Icon
                name="lucide:calendar-x"
                class="h-16 w-16 text-muted-foreground mx-auto mb-4"
            />
            <h3 class="text-xl font-semibold text-muted-foreground mb-2">
                {{ $t('academy.events.no_events') }}
            </h3>
            <p class="text-muted-foreground max-w-md mx-auto">
                {{ $t('academy.events.no_events_description') }}
            </p>
        </div>
    </div>
</template>

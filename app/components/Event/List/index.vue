<script setup lang="ts">
import type { EventData } from '~/types';

const { t } = useI18n();

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

// Helper functions
const getEventTypeIcon = (type: string) => {
    switch (type) {
        case 'in_person':
            return 'lucide:users';
        case 'online':
            return 'lucide:monitor';
        case 'hybrid':
            return 'lucide:globe';
        default:
            return 'lucide:calendar';
    }
};

const getEventTypeLabel = (type: string) => {
    switch (type) {
        case 'in_person':
            return t('academy.events.type.in_person');
        case 'online':
            return t('academy.events.type.online');
        case 'hybrid':
            return t('academy.events.type.hybrid');
        default:
            return type;
    }
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'in_person':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'online':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'hybrid':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
        return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const getPrimaryDate = (event: EventData) => {
    const firstDate = event.dates?.[0];
    return firstDate ? formatDateRange(firstDate.startDate, firstDate.endDate) : '';
};

const getSpeakerNames = (event: EventData) => {
    if (event.speakers && event.speakers.length > 0) {
        return event.speakers
            .map(speaker => `${speaker.firstName} ${speaker.lastName}`)
            .join(', ');
    }
    return '';
};
</script>

<template>
    <div class="w-full">
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
                <div class="bg-muted rounded-lg h-24" />
            </div>
        </div>

        <!-- Events List -->
        <div
            v-else-if="events.length > 0"
            class="space-y-4"
        >
            <Card
                v-for="event in events"
                :key="event.id"
                class="group cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50"
                @click="handleEventClick(event)"
            >
                <CardContent class="p-6">
                    <div class="flex items-start justify-between gap-4">
                        <!-- Main Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-2">
                                <Badge
                                    :class="getEventTypeColor(event.type)"
                                    class="text-sm font-medium"
                                >
                                    <Icon
                                        :name="getEventTypeIcon(event.type)"
                                        class="h-3 w-3 mr-1"
                                    />
                                    {{ getEventTypeLabel(event.type) }}
                                </Badge>
                                <Badge
                                    v-if="event.category"
                                    variant="outline"
                                    class="text-sm"
                                >
                                    {{ event.category.name }}
                                </Badge>
                                <Badge
                                    v-if="event.targetGroup"
                                    variant="secondary"
                                    class="text-sm"
                                >
                                    {{ event.targetGroup.name }}
                                </Badge>
                            </div>

                            <h3 class="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {{ event.title }}
                            </h3>

                            <p class=" text-muted-foreground mb-3 line-clamp-2">
                                {{ event.shortDescription || event.description }}
                            </p>

                            <!-- Event Details -->
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3  text-muted-foreground">
                                <!-- Date -->
                                <div class="flex items-center">
                                    <Icon
                                        name="lucide:calendar"
                                        class="h-4 w-4 mr-2 flex-shrink-0"
                                    />
                                    <span class="truncate">{{ getPrimaryDate(event) }}</span>
                                </div>

                                <!-- Location -->
                                <div
                                    v-if="event.location"
                                    class="flex items-center"
                                >
                                    <Icon
                                        name="lucide:map-pin"
                                        class="h-4 w-4 mr-2 flex-shrink-0"
                                    />
                                    <span class="truncate">{{ event.location }}</span>
                                </div>

                                <!-- Conference Room -->
                                <div
                                    v-if="event.conferenceRoom"
                                    class="flex items-center"
                                >
                                    <Icon
                                        name="lucide:door-open"
                                        class="h-4 w-4 mr-2 flex-shrink-0"
                                    />
                                    <span class="truncate">{{ event.conferenceRoom }}</span>
                                </div>

                                <!-- Max Trainees -->
                                <div
                                    v-if="event.maxTrainee"
                                    class="flex items-center"
                                >
                                    <Icon
                                        name="lucide:user-check"
                                        class="h-4 w-4 mr-2 flex-shrink-0"
                                    />
                                    <span>{{ $t('academy.events.max_participants', { count: event.maxTrainee }) }}</span>
                                </div>
                            </div>

                            <!-- Speakers -->
                            <div
                                v-if="getSpeakerNames(event)"
                                class="mt-2 flex items-center  text-muted-foreground"
                            >
                                <Icon
                                    name="lucide:user"
                                    class="h-4 w-4 mr-2 flex-shrink-0"
                                />
                                <span class="line-clamp-1">{{ getSpeakerNames(event) }}</span>
                            </div>
                        </div>

                        <!-- Right Side -->
                        <div class="flex flex-col items-end gap-3">
                            <!-- Target Attendees -->
                            <div
                                v-if="event.targetAttendees && event.targetAttendees.length > 0"
                                class="flex items-center space-x-1"
                            >
                                <HoverCard>
                                    <HoverCardTrigger class="flex items-center space-x-1 cursor-pointer">
                                        <div
                                            v-for="attendee in event.targetAttendees.slice(0, 3)"
                                            :key="attendee.id"
                                            class="w-3 h-3 rounded-full border border-white"
                                            :style="{ backgroundColor: attendee.color }"
                                        />
                                        <span
                                            v-if="event.targetAttendees.length > 3"
                                            class="text-sm text-muted-foreground ml-1"
                                        >
                                            +{{ event.targetAttendees.length - 3 }}
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                        side="left"
                                        class="w-auto"
                                    >
                                        <div class="space-y-1">
                                            <div class="font-medium text-sm mb-2">
                                                Target Attendees
                                            </div>
                                            <div
                                                v-for="attendee in event.targetAttendees"
                                                :key="attendee.id"
                                                class="flex items-center space-x-2 text-sm"
                                            >
                                                <div
                                                    class="w-2 h-2 rounded-full flex-shrink-0"
                                                    :style="{ backgroundColor: attendee.color }"
                                                />
                                                <span>{{ attendee.name }}</span>
                                            </div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>

                            <!-- Action Button -->
                            <Button
                                variant="ghost"
                                size="sm"
                                class="text-primary hover:text-primary/80"
                            >
                                <Icon
                                    name="lucide:arrow-right"
                                    class="h-4 w-4"
                                />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Empty State -->
        <div
            v-else
            class="text-center py-12"
        >
            <Icon
                name="lucide:calendar-x"
                class="h-16 w-16 text-muted-foreground mx-auto mb-4 !size-6 shrink-0"
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

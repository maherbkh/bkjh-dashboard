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

const currentDate = ref(new Date());

// Day navigation
const goToPreviousDay = () => {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() - 1);
    currentDate.value = newDate;
};

const goToNextDay = () => {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + 1);
    currentDate.value = newDate;
};

const goToToday = () => {
    currentDate.value = new Date();
};

const formattedDate = computed(() => {
    return currentDate.value.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
});

const isToday = computed(() => {
    const today = new Date();
    return currentDate.value.toDateString() === today.toDateString();
});

const eventsForDay = computed(() => {
    const dateStr = currentDate.value.toISOString().split('T')[0] as string;
    return props.events.filter((event) => {
        return event.dates?.some((eventDate) => {
            const startDate = new Date(eventDate.startDate);
            const endDate = new Date(eventDate.endDate);
            const checkDate = new Date(dateStr);

            return checkDate >= startDate && checkDate <= endDate;
        });
    });
});

const handleEventClick = (event: EventData) => {
    emit('eventClick', event);
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'in_person':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
        case 'online':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
        case 'hybrid':
            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
    }
};

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

const getSpeakerNames = (event: EventData) => {
    if (event.speakers && event.speakers.length > 0) {
        return event.speakers
            .map(speaker => `${speaker.firstName} ${speaker.lastName}`)
            .join(', ');
    }
    return '';
};

const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
        return start.toLocaleDateString('de-DE');
    }

    return `${start.toLocaleDateString('de-DE')} - ${end.toLocaleDateString('de-DE')}`;
};

const getPrimaryDate = (event: EventData) => {
    const firstDate = event.dates?.[0];
    return firstDate ? formatDateRange(firstDate.startDate, firstDate.endDate) : '';
};
</script>

<template>
    <div class="w-full">
        <!-- Day Header -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <h2 class="text-2xl font-bold capitalize">
                    {{ formattedDate }}
                </h2>
                <Badge
                    v-if="isToday"
                    variant="default"
                    class="text-sm"
                >
                    {{ $t('academy.calendar.today') }}
                </Badge>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToToday"
                >
                    {{ $t('academy.calendar.go_to_today') }}
                </Button>
            </div>

            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToPreviousDay"
                >
                    <Icon
                        name="lucide:chevron-left"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToNextDay"
                >
                    <Icon
                        name="lucide:chevron-right"
                        class="h-4 w-4"
                    />
                </Button>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="loading"
            class="space-y-4"
        >
            <div
                v-for="i in 3"
                :key="i"
                class="animate-pulse"
            >
                <div class="bg-muted rounded-lg h-32" />
            </div>
        </div>

        <!-- Events for the Day -->
        <div
            v-else-if="eventsForDay.length > 0"
            class="space-y-6"
        >
            <div class=" text-muted-foreground mb-4">
                {{ $t('academy.calendar.events_count', { count: eventsForDay.length }) }}
            </div>

            <div class="space-y-4">
                <Card
                    v-for="event in eventsForDay"
                    :key="event.id"
                    class="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
                    @click="handleEventClick(event)"
                >
                    <CardContent class="p-6">
                        <div class="flex items-start gap-4">
                            <!-- Event Type Icon -->
                            <div :class="['p-3 rounded-full', getEventTypeColor(event.type)]">
                                <Icon
                                    :name="getEventTypeIcon(event.type)"
                                    class="h-6 w-6"
                                />
                            </div>

                            <!-- Event Details -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-4 mb-3">
                                    <div class="flex-1">
                                        <h3 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {{ event.title }}
                                        </h3>

                                        <div class="flex items-center gap-2 mb-2">
                                            <Badge
                                                :class="getEventTypeColor(event.type)"
                                                class="text-sm font-medium"
                                            >
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
                                    </div>

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

                                <!-- Description -->
                                <p class="text-muted-foreground mb-4 line-clamp-3">
                                    {{ event.description || event.shortDescription }}
                                </p>

                                <!-- Event Information Grid -->
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    <!-- Date -->
                                    <div class="flex items-center ">
                                        <Icon
                                            name="lucide:calendar"
                                            class="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"
                                        />
                                        <span>{{ getPrimaryDate(event) }}</span>
                                    </div>

                                    <!-- Location -->
                                    <div
                                        v-if="event.location"
                                        class="flex items-center "
                                    >
                                        <Icon
                                            name="lucide:map-pin"
                                            class="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"
                                        />
                                        <span class="truncate">{{ event.location }}</span>
                                    </div>

                                    <!-- Conference Room -->
                                    <div
                                        v-if="event.conferenceRoom"
                                        class="flex items-center "
                                    >
                                        <Icon
                                            name="lucide:door-open"
                                            class="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"
                                        />
                                        <span class="truncate">{{ event.conferenceRoom }}</span>
                                    </div>

                                    <!-- Max Trainees -->
                                    <div
                                        v-if="event.maxTrainee"
                                        class="flex items-center "
                                    >
                                        <Icon
                                            name="lucide:user-check"
                                            class="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"
                                        />
                                        <span>{{ $t('academy.events.max_participants', { count: event.maxTrainee }) }}</span>
                                    </div>

                                    <!-- Speakers -->
                                    <div
                                        v-if="getSpeakerNames(event)"
                                        class="flex items-center  col-span-full"
                                    >
                                        <Icon
                                            name="lucide:user"
                                            class="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0"
                                        />
                                        <span class="line-clamp-1">{{ getSpeakerNames(event) }}</span>
                                    </div>
                                </div>

                                <!-- Target Attendees -->
                                <div
                                    v-if="event.targetAttendees && event.targetAttendees.length > 0"
                                    class="flex items-center gap-2"
                                >
                                    <span class=" text-muted-foreground">{{ $t('academy.events.target_groups') }}:</span>
                                    <div class="flex items-center space-x-2">
                                        <div
                                            v-for="attendee in event.targetAttendees"
                                            :key="attendee.id"
                                            class="flex items-center space-x-1"
                                        >
                                            <div
                                                class="w-3 h-3 rounded-full border border-white"
                                                :style="{ backgroundColor: attendee.color }"
                                            />
                                            <span class="text-sm text-muted-foreground">{{ attendee.name }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Note -->
                                <div
                                    v-if="event.note"
                                    class="mt-4 p-3 bg-muted/50 rounded-md"
                                >
                                    <div class="flex items-start gap-2">
                                        <Icon
                                            name="lucide:sticky-note"
                                            class="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5"
                                        />
                                        <div>
                                            <span class=" font-medium">{{ $t('academy.events.note') }}:</span>
                                            <p class=" text-muted-foreground mt-1">
                                                {{ event.note }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Empty State -->
        <div
            v-else
            class="text-center py-16"
        >
            <Icon
                name="lucide:calendar-x"
                class="h-16 w-16 text-muted-foreground mx-auto mb-4"
            />
            <h3 class="text-xl font-semibold text-muted-foreground mb-2">
                {{ $t('academy.calendar.no_events_for_day') }}
            </h3>
            <p class="text-muted-foreground max-w-md mx-auto mb-6">
                {{ $t('academy.calendar.no_events_planned') }}
            </p>
            <div class="flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    @click="goToPreviousDay"
                >
                    <Icon
                        name="lucide:chevron-left"
                        class="h-4 w-4 mr-1"
                    />
                    {{ $t('academy.calendar.previous_day') }}
                </Button>
                <Button
                    variant="outline"
                    @click="goToNextDay"
                >
                    {{ $t('academy.calendar.next_day') }}
                    <Icon
                        name="lucide:chevron-right"
                        class="h-4 w-4 ml-1"
                    />
                </Button>
            </div>
        </div>
    </div>
</template>

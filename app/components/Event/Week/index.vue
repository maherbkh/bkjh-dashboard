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

const currentWeekStart = ref(getWeekStart(new Date()));

// Week navigation
const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() - 7);
    currentWeekStart.value = newDate;
};

const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart.value);
    newDate.setDate(newDate.getDate() + 7);
    currentWeekStart.value = newDate;
};

const goToCurrentWeek = () => {
    currentWeekStart.value = getWeekStart(new Date());
};

// Helper functions
function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

const weekDays = computed(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStart.value);
        day.setDate(day.getDate() + i);
        days.push(day);
    }
    return days;
});

const weekRange = computed(() => {
    const start = currentWeekStart.value;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startStr = start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });

    return `${startStr} - ${endStr}`;
});

const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0] as string;
    return props.events.filter((event) => {
        return event.dates?.some((eventDate) => {
            const startDate = new Date(eventDate.startDate);
            const endDate = new Date(eventDate.endDate);
            const checkDate = new Date(dateStr);

            return checkDate >= startDate && checkDate <= endDate;
        });
    });
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const handleEventClick = (event: EventData) => {
    emit('eventClick', event);
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'in_person':
            return 'bg-blue-500 border-blue-600';
        case 'online':
            return 'bg-green-500 border-green-600';
        case 'hybrid':
            return 'bg-purple-500 border-purple-600';
        default:
            return 'bg-gray-500 border-gray-600';
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

const weekDayNames = [
    t('academy.calendar.weekdays.full.monday'),
    t('academy.calendar.weekdays.full.tuesday'),
    t('academy.calendar.weekdays.full.wednesday'),
    t('academy.calendar.weekdays.full.thursday'),
    t('academy.calendar.weekdays.full.friday'),
    t('academy.calendar.weekdays.full.saturday'),
    t('academy.calendar.weekdays.full.sunday'),
];
</script>

<template>
    <div class="w-full">
        <!-- Week Header -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <h2 class="text-2xl font-bold">
                    {{ weekRange }}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToCurrentWeek"
                >
                    {{ $t('academy.calendar.current_week') }}
                </Button>
            </div>

            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToPreviousWeek"
                >
                    <Icon
                        name="lucide:chevron-left"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToNextWeek"
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
            class="animate-pulse"
        >
            <div class="bg-muted rounded-lg h-96" />
        </div>

        <!-- Week Grid -->
        <div
            v-else
            class="bg-card border rounded-lg overflow-hidden"
        >
            <!-- Week Days Header -->
            <div class="grid grid-cols-7 border-b">
                <div
                    v-for="(day, index) in weekDays"
                    :key="index"
                    :class="[
                        'p-4 text-center border-r last:border-r-0',
                        {
                            'bg-primary/10': isToday(day),
                            'bg-muted/50': !isToday(day),
                        },
                    ]"
                >
                    <div class=" font-medium text-muted-foreground">
                        {{ weekDayNames[index] }}
                    </div>
                    <div
                        :class="[
                            'text-2xl font-bold mt-1',
                            {
                                'text-primary': isToday(day),
                                'text-foreground': !isToday(day),
                            },
                        ]"
                    >
                        {{ day.getDate() }}
                    </div>
                    <div class="text-sm text-muted-foreground">
                        {{ day.toLocaleDateString('de-DE', { month: 'short' }) }}
                    </div>
                </div>
            </div>

            <!-- Week Days Content -->
            <div class="grid grid-cols-7 min-h-[400px]">
                <div
                    v-for="(day, index) in weekDays"
                    :key="index"
                    :class="[
                        'p-3 border-r last:border-r-0 space-y-2',
                        {
                            'bg-primary/5': isToday(day),
                        },
                    ]"
                >
                    <!-- Events for this day -->
                    <div class="space-y-2">
                        <div
                            v-for="event in getEventsForDate(day)"
                            :key="event.id"
                            :class="[
                                'p-2 rounded-md border-l-4 cursor-pointer transition-all hover:shadow-md',
                                'bg-white dark:bg-gray-800',
                                getEventTypeColor(event.type),
                            ]"
                            @click="handleEventClick(event)"
                        >
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1 mb-1">
                                        <Icon
                                            :name="getEventTypeIcon(event.type)"
                                            class="h-3 w-3 flex-shrink-0"
                                        />
                                        <span class="text-sm font-medium truncate">{{ event.title }}</span>
                                    </div>

                                    <p class="text-sm text-muted-foreground line-clamp-2">
                                        {{ event.shortDescription || event.description }}
                                    </p>

                                    <div class="mt-1 space-y-1">
                                        <div
                                            v-if="event.location"
                                            class="flex items-center text-sm text-muted-foreground"
                                        >
                                            <Icon
                                                name="lucide:map-pin"
                                                class="h-3 w-3 mr-1 flex-shrink-0"
                                            />
                                            <span class="truncate">{{ event.location }}</span>
                                        </div>

                                        <div
                                            v-if="event.conferenceRoom"
                                            class="flex items-center text-sm text-muted-foreground"
                                        >
                                            <Icon
                                                name="lucide:door-open"
                                                class="h-3 w-3 mr-1 flex-shrink-0"
                                            />
                                            <span class="truncate">{{ event.conferenceRoom }}</span>
                                        </div>

                                        <div
                                            v-if="event.maxTrainee"
                                            class="flex items-center text-sm text-muted-foreground"
                                        >
                                            <Icon
                                                name="lucide:user-check"
                                                class="h-3 w-3 mr-1 flex-shrink-0"
                                            />
                                            <span>{{ event.maxTrainee }} max</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Target Attendees -->
                            <div
                                v-if="event.targetAttendees && event.targetAttendees.length > 0"
                                class="flex items-center space-x-1 mt-2"
                            >
                                <div
                                    v-for="attendee in event.targetAttendees.slice(0, 2)"
                                    :key="attendee.id"
                                    class="w-2 h-2 rounded-full border border-white"
                                    :style="{ backgroundColor: attendee.color }"
                                    :title="attendee.name"
                                />
                                <span
                                    v-if="event.targetAttendees.length > 2"
                                    class="text-sm text-muted-foreground"
                                >
                                    +{{ event.targetAttendees.length - 2 }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Empty state for day -->
                    <div
                        v-if="getEventsForDate(day).length === 0"
                        class="text-center py-8 text-muted-foreground"
                    >
                        <Icon
                            name="lucide:calendar"
                            class="h-6 w-6 mx-auto mb-1 opacity-50"
                        />
                        <p class="text-sm">
                            {{ $t('academy.calendar.no_events') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

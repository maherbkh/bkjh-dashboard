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
const selectedDate = ref<Date | null>(null);

// Calendar navigation
const goToPreviousMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const goToNextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const goToToday = () => {
    currentDate.value = new Date();
    selectedDate.value = new Date();
};

// Calendar calculations
const monthYear = computed(() => {
    return currentDate.value.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
    });
});

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday (1) instead of Sunday (0)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const days = [];
    const currentDay = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        days.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
});

// Event helpers
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

const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.value.getMonth();
};

const isSelected = (date: Date) => {
    return selectedDate.value && date.toDateString() === selectedDate.value.toDateString();
};

const selectDate = (date: Date) => {
    selectedDate.value = date;
};

const handleEventClick = (event: EventData) => {
    emit('eventClick', event);
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'in_person':
            return 'bg-blue-500';
        case 'online':
            return 'bg-green-500';
        case 'hybrid':
            return 'bg-purple-500';
        default:
            return 'bg-gray-500';
    }
};

const weekDays = [
    t('academy.calendar.weekdays.short.monday'),
    t('academy.calendar.weekdays.short.tuesday'),
    t('academy.calendar.weekdays.short.wednesday'),
    t('academy.calendar.weekdays.short.thursday'),
    t('academy.calendar.weekdays.short.friday'),
    t('academy.calendar.weekdays.short.saturday'),
    t('academy.calendar.weekdays.short.sunday'),
];
</script>

<template>
    <div class="w-full">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
                <h2 class="text-2xl font-bold capitalize">
                    {{ monthYear }}
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToToday"
                >
                    {{ $t('academy.calendar.today') }}
                </Button>
            </div>

            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToPreviousMonth"
                >
                    <Icon
                        name="lucide:chevron-left"
                        class="h-4 w-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    @click="goToNextMonth"
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

        <!-- Calendar Grid -->
        <div
            v-else
            class="bg-card border rounded-lg overflow-hidden"
        >
            <!-- Week Days Header -->
            <div class="grid grid-cols-7 border-b">
                <div
                    v-for="day in weekDays"
                    :key="day"
                    class="p-3 text-center  font-medium text-muted-foreground bg-muted/50"
                >
                    {{ day }}
                </div>
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7">
                <div
                    v-for="(day, index) in calendarDays"
                    :key="index"
                    :class="[
                        'min-h-[120px] p-2 border-r border-b cursor-pointer transition-colors',
                        'hover:bg-accent/50',
                        {
                            'bg-muted/30': !isCurrentMonth(day),
                            'bg-primary/10 border-primary': isSelected(day),
                            'bg-accent': isToday(day) && !isSelected(day),
                        },
                    ]"
                    @click="selectDate(day)"
                >
                    <!-- Day Number -->
                    <div class="flex items-center justify-between mb-1">
                        <span
                            :class="[
                                ' font-medium',
                                {
                                    'text-muted-foreground': !isCurrentMonth(day),
                                    'text-primary font-bold': isToday(day),
                                    'text-foreground': isCurrentMonth(day) && !isToday(day),
                                },
                            ]"
                        >
                            {{ day.getDate() }}
                        </span>
                    </div>

                    <!-- Events for this day -->
                    <div class="space-y-1">
                        <div
                            v-for="event in getEventsForDate(day).slice(0, 3)"
                            :key="event.id"
                            :class="[
                                'text-sm p-1 rounded text-white cursor-pointer truncate',
                                getEventTypeColor(event.type),
                            ]"
                            :title="event.title"
                            @click.stop="handleEventClick(event)"
                        >
                            {{ event.title }}
                        </div>

                        <!-- More events indicator -->
                        <div
                            v-if="getEventsForDate(day).length > 3"
                            class="text-sm text-muted-foreground font-medium"
                        >
                            {{ $t('academy.calendar.more_events', { count: getEventsForDate(day).length - 3 }) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Selected Date Events -->
        <div
            v-if="selectedDate"
            class="mt-6"
        >
            <h3 class="text-lg font-semibold mb-4">
                {{ $t('academy.calendar.events_on_date', { date: selectedDate.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }) }) }}
            </h3>

            <div class="space-y-3">
                <Card
                    v-for="event in getEventsForDate(selectedDate)"
                    :key="event.id"
                    class="cursor-pointer hover:shadow-md transition-shadow"
                    @click="handleEventClick(event)"
                >
                    <CardContent class="p-4">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h4 class="font-semibold mb-1">
                                    {{ event.title }}
                                </h4>
                                <p class=" text-muted-foreground line-clamp-2">
                                    {{ event.shortDescription || event.description }}
                                </p>
                                <div class="flex items-center mt-2 text-sm text-muted-foreground">
                                    <Badge
                                        :class="getEventTypeColor(event.type)"
                                        class="text-white mr-2"
                                    >
                                        {{ event.type }}
                                    </Badge>
                                    <span v-if="event.location">{{ event.location }}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                            >
                                <Icon
                                    name="lucide:arrow-right"
                                    class="h-4 w-4"
                                />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div
                    v-if="getEventsForDate(selectedDate).length === 0"
                    class="text-center py-8 text-muted-foreground"
                >
                    <Icon
                        name="lucide:calendar-x"
                        class="h-8 w-8 mx-auto mb-2"
                    />
                    <p>{{ $t('academy.calendar.no_events_on_date') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

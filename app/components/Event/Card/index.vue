<script setup lang="ts">
import type { EventData } from '~/types';

const { t } = useI18n();

interface Props {
    eventItem: EventData;
    showFullDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showFullDescription: false,
});
const { eventItem, showFullDescription } = toRefs(props);

const emit = defineEmits<{
    click: [eventItem: EventData];
}>();

const handleClick = () => {
    emit('click', props.eventItem);
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

const primaryDate = computed(() => {
    const firstDate = props.eventItem.dates?.[0];
    return firstDate ? formatDateRange(firstDate.startDate, firstDate.endDate) : '';
});

const speakerNames = computed(() => {
    if (props.eventItem.speakers && props.eventItem.speakers.length > 0) {
        return props.eventItem.speakers
            .map(speaker => `${speaker.firstName} ${speaker.lastName}`)
            .join(', ');
    }
    return '';
});
</script>

<template>
    <Card
        class="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] h-full flex flex-col"
        @click="handleClick"
    >
        <CardHeader class="pb-3">
            <div class="flex items-start justify-between gap-2 mb-2">
                <Badge
                    variant="outline"
                    class="text-sm font-medium"
                >
                    <Icon
                        :name="getEventTypeIcon(eventItem.type)"
                        class="h-3 w-3 mr-1"
                    />
                    {{ getEventTypeLabel(eventItem.type) }}
                </Badge>
                <Badge
                    v-if="eventItem.category"
                    variant="outline"
                    class="text-sm"
                >
                    {{ eventItem.category.name }}
                </Badge>
            </div>

            <CardTitle class="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {{ eventItem.title }}
            </CardTitle>

            <div class="flex items-center  text-muted-foreground mt-2">
                <Icon
                    name="lucide:calendar"
                    class="h-4 w-4 mr-1"
                />
                <span>{{ primaryDate }}</span>
            </div>
        </CardHeader>

        <CardContent class="flex-1 flex flex-col">
            <p
                :class="[
                    ' text-muted-foreground mb-4 flex-1',
                    showFullDescription ? '' : 'line-clamp-2',
                ]"
            >
                {{ eventItem.shortDescription || eventItem.description }}
            </p>

            <div class="space-y-3 mt-auto">
                <!-- Location -->
                <div
                    v-if="eventItem.location"
                    class="flex items-center  text-muted-foreground"
                >
                    <Icon
                        name="lucide:map-pin"
                        class="h-4 w-4 mr-2 flex-shrink-0"
                    />
                    <span class="line-clamp-1">{{ eventItem.location }}</span>
                </div>

                <!-- Conference Room -->
                <div
                    v-if="eventItem.conferenceRoom"
                    class="flex items-center  text-muted-foreground"
                >
                    <Icon
                        name="lucide:door-open"
                        class="h-4 w-4 mr-2 flex-shrink-0"
                    />
                    <span class="line-clamp-1">{{ eventItem.conferenceRoom }}</span>
                </div>

                <!-- Speakers -->
                <div
                    v-if="speakerNames"
                    class="flex items-center  text-muted-foreground"
                >
                    <Icon
                        name="lucide:user"
                        class="h-4 w-4 mr-2 flex-shrink-0"
                    />
                    <span class="line-clamp-1">{{ speakerNames }}</span>
                </div>

                <!-- Target Group -->
                <div
                    v-if="eventItem.targetGroup"
                    class="flex items-center  text-muted-foreground"
                >
                    <Icon
                        name="lucide:users"
                        class="h-4 w-4 mr-2 flex-shrink-0"
                    />
                    <span class="line-clamp-1">{{ eventItem.targetGroup.name }}</span>
                </div>

                <!-- Max Trainees -->
                <div
                    v-if="eventItem.maxTrainee"
                    class="flex items-center  text-muted-foreground"
                >
                    <Icon
                        name="lucide:user-check"
                        class="h-4 w-4 mr-2 flex-shrink-0"
                    />
                    <span>{{ $t('academy.events.max_participants', { count: eventItem.maxTrainee }) }}</span>
                </div>
            </div>
        </CardContent>

        <CardFooter class="pt-3">
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-2">
                    <div
                        v-if="eventItem.targetAttendees && eventItem.targetAttendees.length > 0"
                        class="flex items-center space-x-1"
                    >
                        <HoverCard>
                            <HoverCardTrigger class="flex items-center space-x-1 cursor-pointer">
                                <div
                                    v-for="attendee in eventItem.targetAttendees.slice(0, 3)"
                                    :key="attendee.id"
                                    class="w-3 h-3 rounded-full border border-white"
                                    :style="{ backgroundColor: attendee.color }"
                                />
                                <span
                                    v-if="eventItem.targetAttendees.length > 3"
                                    class="text-sm text-muted-foreground ml-1"
                                >
                                    +{{ eventItem.targetAttendees.length - 3 }}
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
                                        v-for="attendee in eventItem.targetAttendees"
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
        </CardFooter>
    </Card>
</template>

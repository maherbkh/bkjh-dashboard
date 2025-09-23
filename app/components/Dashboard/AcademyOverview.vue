<template>
    <div class="flex flex-col gap-6">
        <!-- Header Section -->
        <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold tracking-tight">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
            <p class="text-muted-foreground">
                {{ $t('academy.plural') }} {{ $t('global.dashboard') }} - {{ $t('global.overview') }}
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('academy.plural') }}
                    </CardTitle>
                    <Icon
                        name="solar:calendar-outline"
                        class="h-4 w-4 text-muted-foreground"
                    />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">
                        {{ sampleData.totalEvents }}
                    </div>
                    <p class="text-xs text-muted-foreground">
                        +{{ sampleData.newEvents }} {{ $t('common.new') }} {{ $t('academy.plural') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('attendee.plural') }}
                    </CardTitle>
                    <Icon
                        name="solar:users-group-rounded-outline"
                        class="h-4 w-4 text-muted-foreground"
                    />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-blue-600">
                        {{ sampleData.totalAttendees }}
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {{ sampleData.activeAttendees }} {{ $t('common.active') }} {{ $t('attendee.plural') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('speaker.plural') }}
                    </CardTitle>
                    <Icon
                        name="solar:microphone-outline"
                        class="h-4 w-4 text-muted-foreground"
                    />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-purple-600">
                        {{ sampleData.totalSpeakers }}
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {{ sampleData.availableSpeakers }} {{ $t('common.available') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('common.upcoming') }}
                    </CardTitle>
                    <Icon
                        name="solar:clock-circle-outline"
                        class="h-4 w-4 text-muted-foreground"
                    />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-orange-600">
                        {{ sampleData.upcomingEvents }}
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {{ $t('common.next') }} {{ $t('common.week') }}
                    </p>
                </CardContent>
            </Card>
        </div>

        <!-- Upcoming Events & Quick Actions -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
                <CardHeader>
                    <CardTitle>{{ $t('common.upcoming') }} {{ $t('academy.plural') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div
                            v-for="event in sampleData.upcomingEventList"
                            :key="event.id"
                            class="flex items-center space-x-4"
                        >
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                    {{ event.date }}
                                </div>
                            </div>
                            <div class="flex-1 space-y-1">
                                <p class="text-sm font-medium leading-none">
                                    {{ event.title }}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    {{ event.description }}
                                </p>
                                <div class="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div class="flex items-center gap-1">
                                        <Icon
                                            name="solar:map-pin-outline"
                                            class="h-3 w-3"
                                        />
                                        {{ event.location }}
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Icon
                                            name="solar:user-outline"
                                            class="h-3 w-3"
                                        />
                                        {{ event.speaker }}
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <Icon
                                            name="solar:users-group-rounded-outline"
                                            class="h-3 w-3"
                                        />
                                        {{ event.attendees }} {{ $t('attendee.plural') }}
                                    </div>
                                </div>
                            </div>
                            <div class="flex-shrink-0">
                                <Badge :variant="event.status === 'full' ? 'destructive' : 'default'">
                                    {{ $t(`common.${event.status}`) }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="col-span-3">
                <CardHeader>
                    <CardTitle>{{ $t('common.quick_actions') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-2">
                        <Button
                            variant="outline"
                            class="w-full justify-start"
                        >
                            <Icon
                                name="solar:calendar-plus-outline"
                                class="mr-2 h-4 w-4"
                            />
                            {{ $t('action.add') }} {{ $t('academy.singular') }}
                        </Button>
                        <Button
                            variant="outline"
                            class="w-full justify-start"
                        >
                            <Icon
                                name="solar:user-plus-outline"
                                class="mr-2 h-4 w-4"
                            />
                            {{ $t('action.add') }} {{ $t('attendee.singular') }}
                        </Button>
                        <Button
                            variant="outline"
                            class="w-full justify-start"
                        >
                            <Icon
                                name="solar:microphone-plus-outline"
                                class="mr-2 h-4 w-4"
                            />
                            {{ $t('action.add') }} {{ $t('speaker.singular') }}
                        </Button>
                        <Button
                            variant="outline"
                            class="w-full justify-start"
                        >
                            <Icon
                                name="solar:category-outline"
                                class="mr-2 h-4 w-4"
                            />
                            {{ $t('action.add') }} {{ $t('event_category.singular') }}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Recent Activity & Analytics -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
                <CardHeader>
                    <CardTitle>{{ $t('common.recent_activity') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div
                            v-for="activity in sampleData.recentActivities"
                            :key="activity.id"
                            class="flex items-center space-x-4"
                        >
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Icon
                                        :name="activity.icon"
                                        class="h-4 w-4"
                                    />
                                </div>
                            </div>
                            <div class="flex-1 space-y-1">
                                <p class="text-sm font-medium leading-none">
                                    {{ activity.title }}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    {{ activity.description }}
                                </p>
                            </div>
                            <div class="flex-shrink-0 text-xs text-muted-foreground">
                                {{ activity.time }}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card class="col-span-3">
                <CardHeader>
                    <CardTitle>{{ $t('common.analytics') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.attendance_rate') }}</span>
                            <span class="text-sm text-muted-foreground">87%</span>
                        </div>
                        <Progress
                            :value="87"
                            class="w-full"
                        />

                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.satisfaction') }}</span>
                            <span class="text-sm text-muted-foreground">4.6/5</span>
                        </div>
                        <Progress
                            :value="92"
                            class="w-full"
                        />

                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.completion_rate') }}</span>
                            <span class="text-sm text-muted-foreground">94%</span>
                        </div>
                        <Progress
                            :value="94"
                            class="w-full"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Featured Speakers -->
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('common.featured') }} {{ $t('speaker.plural') }}</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div
                        v-for="speaker in sampleData.featuredSpeakers"
                        :key="speaker.id"
                        class="flex flex-col items-center space-y-3 p-4 border rounded-lg"
                    >
                        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                            {{ speaker.initials }}
                        </div>
                        <div class="text-center space-y-1">
                            <p class="text-sm font-medium">
                                {{ speaker.name }}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                {{ speaker.specialization }}
                            </p>
                            <div class="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <Icon
                                    name="solar:star-bold"
                                    class="h-3 w-3 text-yellow-500"
                                />
                                {{ speaker.rating }}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const { t } = useI18n();
const userStore = useUserStore();

// Sample data for academy overview
const sampleData = ref({
    totalEvents: 34,
    newEvents: 5,
    totalAttendees: 1247,
    activeAttendees: 892,
    totalSpeakers: 28,
    availableSpeakers: 18,
    upcomingEvents: 8,
    upcomingEventList: [
        {
            id: 1,
            title: 'Advanced Web Development Workshop',
            description: 'Learn modern web development techniques and best practices',
            date: '15',
            location: 'Conference Room A',
            speaker: 'Dr. Sarah Johnson',
            attendees: 45,
            status: 'available',
        },
        {
            id: 2,
            title: 'Data Science Fundamentals',
            description: 'Introduction to data science and machine learning',
            date: '18',
            location: 'Training Lab B',
            speaker: 'Prof. Michael Chen',
            attendees: 32,
            status: 'full',
        },
        {
            id: 3,
            title: 'Cloud Architecture Best Practices',
            description: 'Design scalable and secure cloud solutions',
            date: '22',
            location: 'Virtual Session',
            speaker: 'Alex Rodriguez',
            attendees: 67,
            status: 'available',
        },
    ],
    recentActivities: [
        {
            id: 1,
            title: 'Event completed',
            description: 'JavaScript Fundamentals workshop completed successfully',
            icon: 'solar:check-circle-outline',
            time: '2 hours ago',
        },
        {
            id: 2,
            title: 'New registration',
            description: '25 new attendees registered for Cloud Architecture',
            icon: 'solar:user-plus-outline',
            time: '4 hours ago',
        },
        {
            id: 3,
            title: 'Speaker added',
            description: 'Dr. Emily Watson added as speaker for AI Workshop',
            icon: 'solar:microphone-plus-outline',
            time: '1 day ago',
        },
        {
            id: 4,
            title: 'Event created',
            description: 'New event "Cybersecurity Basics" scheduled',
            icon: 'solar:calendar-plus-outline',
            time: '2 days ago',
        },
    ],
    featuredSpeakers: [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            initials: 'SJ',
            specialization: 'Web Development',
            rating: 4.9,
        },
        {
            id: 2,
            name: 'Prof. Michael Chen',
            initials: 'MC',
            specialization: 'Data Science',
            rating: 4.8,
        },
        {
            id: 3,
            name: 'Alex Rodriguez',
            initials: 'AR',
            specialization: 'Cloud Architecture',
            rating: 4.7,
        },
        {
            id: 4,
            name: 'Dr. Emily Watson',
            initials: 'EW',
            specialization: 'Artificial Intelligence',
            rating: 4.9,
        },
    ],
});
</script>

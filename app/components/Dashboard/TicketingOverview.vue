<template>
    <div class="flex flex-col gap-6">
        <!-- Header Section -->
        <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold tracking-tight">
                {{ $t('auth.welcome_back') }}, {{ userStore.user?.firstName || userStore.user?.name || 'User' }}
            </h1>
            <p class="text-muted-foreground">
                {{ $t('it_support.singular') }} {{ $t('global.dashboard') }} - {{ $t('global.overview') }}
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('ticket.plural') }}
                    </CardTitle>
                    <Icon name="solar:ticket-outline" class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ sampleData.totalTickets }}</div>
                    <p class="text-xs text-muted-foreground">
                        +{{ sampleData.newTickets }} {{ $t('common.new') }} {{ $t('ticket.plural') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('common.pending') }}
                    </CardTitle>
                    <Icon name="solar:clock-circle-outline" class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-orange-600">{{ sampleData.pendingTickets }}</div>
                    <p class="text-xs text-muted-foreground">
                        {{ $t('common.awaiting') }} {{ $t('common.response') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('common.in_progress') }}
                    </CardTitle>
                    <Icon name="solar:work-outline" class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-blue-600">{{ sampleData.inProgressTickets }}</div>
                    <p class="text-xs text-muted-foreground">
                        {{ $t('common.being') }} {{ $t('common.processed') }}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">
                        {{ $t('common.resolved') }}
                    </CardTitle>
                    <Icon name="solar:check-circle-outline" class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-green-600">{{ sampleData.resolvedTickets }}</div>
                    <p class="text-xs text-muted-foreground">
                        {{ $t('common.this') }} {{ $t('common.week') }}
                    </p>
                </CardContent>
            </Card>
        </div>

        <!-- Priority Tickets & Quick Actions -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
                <CardHeader>
                    <CardTitle>{{ $t('common.high_priority') }} {{ $t('ticket.plural') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div v-for="ticket in sampleData.priorityTickets" :key="ticket.id" class="flex items-center space-x-4">
                            <div class="flex-shrink-0">
                                <Badge :variant="ticket.priority === 'high' ? 'destructive' : 'secondary'">
                                    {{ $t(`common.${ticket.priority}`) }}
                                </Badge>
                            </div>
                            <div class="flex-1 space-y-1">
                                <p class="text-sm font-medium leading-none">
                                    #{{ ticket.id }} - {{ ticket.title }}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    {{ ticket.description }}
                                </p>
                                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Icon name="solar:user-outline" class="h-3 w-3" />
                                    {{ ticket.assignedTo }}
                                    <Icon name="solar:clock-outline" class="h-3 w-3 ml-2" />
                                    {{ ticket.createdAt }}
                                </div>
                            </div>
                            <div class="flex-shrink-0">
                                <Badge :variant="ticket.status === 'pending' ? 'outline' : 'default'">
                                    {{ $t(`common.${ticket.status}`) }}
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
                        <Button variant="outline" class="w-full justify-start">
                            <Icon name="solar:ticket-plus-outline" class="mr-2 h-4 w-4" />
                            {{ $t('action.add') }} {{ $t('ticket.singular') }}
                        </Button>
                        <Button variant="outline" class="w-full justify-start">
                            <Icon name="solar:user-plus-outline" class="mr-2 h-4 w-4" />
                            {{ $t('action.add') }} {{ $t('user.singular') }}
                        </Button>
                        <Button variant="outline" class="w-full justify-start">
                            <Icon name="solar:building-plus-outline" class="mr-2 h-4 w-4" />
                            {{ $t('action.add') }} {{ $t('company.singular') }}
                        </Button>
                        <Button variant="outline" class="w-full justify-start">
                            <Icon name="solar:category-outline" class="mr-2 h-4 w-4" />
                            {{ $t('action.add') }} {{ $t('category.singular') }}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Recent Activity & Performance -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card class="col-span-4">
                <CardHeader>
                    <CardTitle>{{ $t('common.recent_activity') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div v-for="activity in sampleData.recentActivities" :key="activity.id" class="flex items-center space-x-4">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Icon :name="activity.icon" class="h-4 w-4" />
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
                    <CardTitle>{{ $t('common.performance') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.response_time') }}</span>
                            <span class="text-sm text-muted-foreground">2.3h</span>
                        </div>
                        <Progress :value="85" class="w-full" />
                        
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.resolution_rate') }}</span>
                            <span class="text-sm text-muted-foreground">94%</span>
                        </div>
                        <Progress :value="94" class="w-full" />
                        
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium">{{ $t('common.satisfaction') }}</span>
                            <span class="text-sm text-muted-foreground">4.8/5</span>
                        </div>
                        <Progress :value="96" class="w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// Sample data for ticketing overview
const sampleData = ref({
    totalTickets: 156,
    newTickets: 12,
    pendingTickets: 23,
    inProgressTickets: 8,
    resolvedTickets: 45,
    priorityTickets: [
        {
            id: 'T-2024-001',
            title: 'Server Down - Production',
            description: 'Production server is not responding',
            priority: 'high',
            status: 'pending',
            assignedTo: 'John Smith',
            createdAt: '2 hours ago'
        },
        {
            id: 'T-2024-002',
            title: 'Database Connection Issues',
            description: 'Users cannot access the database',
            priority: 'high',
            status: 'in_progress',
            assignedTo: 'Sarah Johnson',
            createdAt: '4 hours ago'
        },
        {
            id: 'T-2024-003',
            title: 'Email System Failure',
            description: 'Outgoing emails are not being sent',
            priority: 'medium',
            status: 'pending',
            assignedTo: 'Mike Wilson',
            createdAt: '6 hours ago'
        }
    ],
    recentActivities: [
        {
            id: 1,
            title: 'Ticket resolved',
            description: 'T-2024-004 - Printer configuration completed',
            icon: 'solar:check-circle-outline',
            time: '5 min ago'
        },
        {
            id: 2,
            title: 'New ticket assigned',
            description: 'T-2024-005 assigned to Sarah Johnson',
            icon: 'solar:user-outline',
            time: '15 min ago'
        },
        {
            id: 3,
            title: 'Priority updated',
            description: 'T-2024-006 marked as high priority',
            icon: 'solar:warning-outline',
            time: '1 hour ago'
        },
        {
            id: 4,
            title: 'Ticket created',
            description: 'New ticket T-2024-007 submitted by user',
            icon: 'solar:plus-circle-outline',
            time: '2 hours ago'
        }
    ]
})
</script>

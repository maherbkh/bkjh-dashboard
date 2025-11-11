<script setup lang="ts">
import { toast } from 'vue-sonner';

const { t } = useI18n();
const { formatDateParts, formatDateShort } = useGermanDateFormat();

interface PendingRegistration {
    id: string;
    registrationStatus: string;
    registeredAt: string;
    notes: string | null;
    event: {
        id: string;
        title: string;
        slug: string;
        type: string;
        maxCapacity: number;
        room: string | null;
        location: string | null;
        schedules: Array<{
            id: string;
            date: string;
            startTime: string;
            endTime: string;
            note: string | null;
        }>;
    };
    attendee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        isEmployee: boolean;
    };
}

interface PendingRegistrationsResponse {
    statusCode: number;
    message: string;
    data: PendingRegistration[];
}

// Fetch data from API
const { data, pending, error, refresh } = useApiFetch<PendingRegistrationsResponse>('/academy/overview/pending-registrations');

const registrations = computed(() => data.value?.data || []);

const headerItems = computed(() => [
    { as: 'th' as const, name: t('academy.dashboard.event_info'), id: 'event' },
    { as: 'th' as const, name: t('attendee.person'), id: 'person' },
    { as: 'th' as const, name: t('attendee.registration_info'), id: 'registration' },
]);

const statuses = ref<string[]>(['PENDING', 'APPROVED', 'REJECTED']);
const loadingStates = ref<Record<string, boolean>>({});

// Debounced status change function
const changeStatus = useDebounceFn(async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (loadingStates.value[id]) return; // Prevent multiple calls for same item
    
    loadingStates.value[id] = true;
    
    try {
        const { data: responseData, error: responseError } = await useApiFetch(`/academy/events/registrations/${id}/status`, {
            method: 'PATCH',
            body: {
                status: status,
                note: '',
            },
        });
        
        if (responseError.value) {
            toast.error(responseError.value.message);
        } else if (responseData.value) {
            toast.success(responseData.value.message as string);
            // Refresh the data
            await refresh();
        }
    } catch (err) {
        toast.error('Failed to update status');
    } finally {
        loadingStates.value[id] = false;
    }
}, 300);

// Computed class function for better performance
const getStatusClass = (status: string, rowStatus: string) => {
    const baseClasses = 'cursor-pointer hover:bg-accent';
    const conditionalClasses = [];
    
    if (status === 'PENDING') conditionalClasses.push('text-muted-foreground');
    if (status === 'APPROVED') conditionalClasses.push('hover:!bg-success/10 hover:!text-success');
    if (status === 'REJECTED') conditionalClasses.push('hover:!bg-destructive/10 hover:!text-destructive');
    if (status === rowStatus) conditionalClasses.push('font-medium');
    if (rowStatus === status && status === 'APPROVED') conditionalClasses.push('text-success');
    if (rowStatus === status && status === 'REJECTED') conditionalClasses.push('text-destructive');
    
    return [baseClasses, ...conditionalClasses];
};

// Format event type
const formatEventType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'IN_PERSON': t('academy.type.in_person'),
        'ONLINE': t('academy.type.online'),
        'HYBRID': t('academy.type.hybrid'),
    };
    return typeMap[type] || type;
};

// Get full name from attendee
const getFullName = (attendee: PendingRegistration['attendee']): string => {
    return `${attendee.firstName} ${attendee.lastName}`;
};

// Get status label
const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        'PENDING': t('academy.dashboard.pending'),
        'APPROVED': t('academy.dashboard.approved'),
        'REJECTED': t('academy.dashboard.rejected'),
    };
    return statusMap[status] || status;
};
</script>

<template>
    <div id="pending-registrations-table" class="flex flex-col gap-4">
        <Card class="bg-muted/50 border-border/50">
            <CardHeader class="pb-3">
                <div class="flex items-center gap-3">
                    <Icon
                        name="solar:clock-circle-bold"
                        class="!size-5 shrink-0 text-muted-foreground"
                    />
                    <CardTitle class="text-sm font-medium">
                        {{ t('academy.dashboard.recent_registrations') }}
                    </CardTitle>
                </div>
                <CardDescription class="text-xs">
                    {{ t('academy.dashboard.recent_registrations_description') }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <!-- Loading State -->
                <div v-if="pending" class="space-y-3">
                    <Skeleton v-for="i in 3" :key="i" class="h-16 w-full" />
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-8">
                    <p class="text-destructive font-medium">{{ t('common.error.loading_failed') }}</p>
                    <p class="text-sm text-muted-foreground mt-2">
                        {{ error?.message || error?.data?.message || t('common.error.generic') }}
                    </p>
                </div>

                <!-- Empty State -->
                <PageEmptyState
                    v-else-if="registrations.length === 0"
                    :search-query="''"
                    :add-new-text="t('academy.dashboard.recent_registrations')"
                    :no-add-new-text="true"
                />

                <!-- Table -->
                <PageTable
                    v-else
                    :header-items="headerItems"
                    :rows="registrations"
                    :selected-rows="[]"
                    :loading="false"
                    :skeleton-rows="3"
                    :selectable="false"
                    :sortable="false"
                >
                    <template #cell-event="{ row }">
                        <div class="flex flex-col">
                            <div class="font-medium">
                                {{ row.event.title }}
                            </div>
                            <div
                                v-if="row.event.schedules && row.event.schedules.length > 0"
                                class="mt-1 text-muted-foreground flex items-center gap-1 whitespace-nowrap text-xs"
                            >
                                <div>
                                    {{ formatDateShort(row.event.schedules[0]?.date) }}
                                </div>
                                <template v-if="row.event.schedules.length > 1">
                                    <Icon
                                        name="solar:arrow-right-bold-duotone"
                                        class="size-5 shrink-0 opacity-75"
                                    />
                                    <div>
                                        {{ formatDateShort(row.event.schedules[(row.event.schedules.length - 1)]?.date) }}
                                    </div>
                                </template>
                            </div>
                            <div class="mt-1 text-xs text-muted-foreground">
                                <span>{{ formatEventType(row.event.type) }}</span>
                                <template v-if="row.event.location || row.event.room">
                                    <span v-if="row.event.type"> • </span>
                                    <span v-if="row.event.location">{{ row.event.location }}</span>
                                    <template v-if="row.event.location && row.event.room">, </template>
                                    <span v-if="row.event.room">{{ row.event.room }}</span>
                                </template>
                            </div>
                        </div>
                    </template>

                    <template #cell-person="{ row }">
                        <div class="flex flex-col">
                            <div>
                                <div class="flex items-center gap-2">
                                    <div>
                                        <Avatar
                                            class="size-9 rounded-full border
                                           group-active:bg-sidebar-primary group-active:text-sidebar-primary-foreground
                                           group-data-[state=open]:bg-sidebar-accent group-data-[state=open]:text-sidebar-accent-foreground"
                                        >
                                            <AvatarImage
                                                class="bg-background"
                                                :src="undefined"
                                                :alt="getFullName(row.attendee)"
                                            />
                                            <AvatarFallback class="rounded-full bg-background">
                                                {{ useInitials(getFullName(row.attendee)) }}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div class="font-medium">
                                            {{ getFullName(row.attendee) }}
                                        </div>
                                        <div class="text-muted-foreground text-xs">
                                            {{ row.attendee.email }}
                                        </div>
                                        <div class="text-muted-foreground text-xs mt-0.5">
                                            <Badge
                                                :variant="row.attendee.isEmployee ? 'default' : 'outline'"
                                                class="text-xs"
                                            >
                                                {{ row.attendee.isEmployee ? t('academy.dashboard.employee') : t('academy.dashboard.non_employee') }}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #cell-registration="{ row }">
                        <div class="flex flex-col">
                            <div class="text-sm font-medium flex items-start gap-1.5">
                                <div class="flex items-start gap-1.5">
                                    <Icon
                                        name="solar:calendar-mark-line-duotone"
                                        class="opacity-50 !size-4"
                                    />
                                    {{ formatDateParts(row.registeredAt).date }}
                                </div>
                                <Icon
                                    name="solar:arrow-right-bold-duotone"
                                    class="size-5 mt-0.5 shrink-0 opacity-50"
                                />
                                <div class="flex items-start gap-1.5">
                                    <Icon
                                        name="solar:watch-square-line-duotone"
                                        class="opacity-50 !size-4"
                                    />
                                    {{ formatDateParts(row.registeredAt).time }}
                                </div>
                            </div>
                            <div class="mt-1">
                                <Badge
                                    :variant="row.registrationStatus === 'APPROVED' ? 'success' : row.registrationStatus === 'PENDING' ? 'pending' : 'destructive'"
                                    class="w-fit"
                                >
                                    {{ getStatusLabel(row.registrationStatus) }}
                                </Badge>
                            </div>
                        </div>
                    </template>

                    <template #cell-actions="{ row }">
                        <div class="flex justify-end gap-2">
                            <NuxtLink :to="`/events/${row.event.id}`">
                                <LazyButton
                                    :title="$t('action.view') + ' ' + $t('academy.singular')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                >
                                    <Icon
                                        name="solar:eye-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                            </NuxtLink>
                            <NuxtLink :to="`/events/attendees/${row.attendee.id}`">
                                <LazyButton
                                    :title="$t('action.view') + ' ' + $t('attendee.singular')"
                                    variant="ghost"
                                    size="icon"
                                    hydrate-on-interaction="mouseover"
                                >
                                    <Icon
                                        name="solar:user-outline"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </LazyButton>
                            </NuxtLink>
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <Icon
                                            name="solar:menu-dots-bold"
                                            class="size-5 shrink-0"
                                        />
                                        <span class="sr-only">{{ $t('common.actions') }}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent class="min-w-40">
                                    <DropdownMenuRadioGroup :model-value="row.registrationStatus">
                                        <DropdownMenuRadioItem
                                            v-for="status in statuses"
                                            :key="status"
                                            @click="changeStatus(row.id, status as 'PENDING' | 'APPROVED' | 'REJECTED')"
                                            :value="status"
                                            :class="getStatusClass(status, row.registrationStatus)"
                                            :disabled="loadingStates[row.id]"
                                        >
                                            <div class="flex items-center gap-2">
                                                <span>{{ getStatusLabel(status) }}</span>
                                                <Icon
                                                    v-if="loadingStates[row.id]"
                                                    name="solar:loading-bold"
                                                    class="size-3 animate-spin"
                                                />
                                            </div>
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </template>
                </PageTable>
            </CardContent>
        </Card>
    </div>
</template>


<script setup lang="ts">
import { toast } from 'vue-sonner';
import { useDebounceFn } from '@vueuse/core';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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

const registrations = computed((): PendingRegistration[] => {
    if (!data.value?.data) return [];
    return Array.isArray(data.value.data) ? data.value.data : [];
});

const headerItems = computed(() => [
    { as: 'th' as const, name: t('academy.dashboard.event_info'), id: 'event' },
    { as: 'th' as const, name: t('attendee.person'), id: 'person' },
    { as: 'th' as const, name: t('attendee.employment_details'), id: 'employment' },
    { as: 'th' as const, name: t('attendee.registration_info'), id: 'registration' },
]);

const statuses = ref<string[]>(['PENDING', 'APPROVED', 'REJECTED']);
const loadingStates = ref<Record<string, boolean>>({});

// Rejection modal state
const showRejectionModal = ref(false);
const rejectionNote = ref('');
const pendingRejectionId = ref<string | null>(null);

// Note view modal state
const showNoteModal = ref(false);
const selectedNote = ref<string | null>(null);

// Debounced status change function
const changeStatus = useDebounceFn(async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (loadingStates.value[id]) return; // Prevent multiple calls for same item

    // Find the current registration to check its status
    const registration = registrations.value.find(item => item.id === id);
    const currentStatus = registration?.registrationStatus;

    // If changing from PENDING to REJECTED, show modal instead of immediate API call
    if (currentStatus === 'PENDING' && status === 'REJECTED') {
        pendingRejectionId.value = id;
        rejectionNote.value = '';
        showRejectionModal.value = true;
        return;
    }

    // For all other status changes, proceed with API call
    loadingStates.value[id] = true;

    try {
        const { data: responseData, error: responseError } = await useApiFetch(`/academy/events/registrations/${id}/status`, {
            method: 'PATCH',
            body: {
                status: status,
                note: null,
            },
        });

        if (responseError.value) {
            toast.error(responseError.value.message);
        }
        else if (responseData.value) {
            toast.success(responseData.value.message as string);
            // Refresh the data
            await refresh();
        }
    }
    catch (err) {
        toast.error('Failed to update status');
    }
    finally {
        loadingStates.value[id] = false;
    }
}, 300);

// Confirm rejection with note
const confirmRejection = async () => {
    if (!pendingRejectionId.value) return;

    const id = pendingRejectionId.value;
    loadingStates.value[id] = true;

    try {
        const { data: responseData, error: responseError } = await useApiFetch(`/academy/events/registrations/${id}/status`, {
            method: 'PATCH',
            body: {
                status: 'REJECTED',
                note: rejectionNote.value.trim() || null,
            },
        });

        if (responseError.value) {
            toast.error(responseError.value.message);
        }
        else if (responseData.value) {
            toast.success(responseData.value.message as string);
            // Refresh the data
            await refresh();
            // Close modal and reset state
            showRejectionModal.value = false;
            rejectionNote.value = '';
            pendingRejectionId.value = null;
        }
    }
    catch (err) {
        toast.error('Failed to update status');
    }
    finally {
        loadingStates.value[id] = false;
    }
};

// Cancel rejection modal
const cancelRejection = () => {
    showRejectionModal.value = false;
    rejectionNote.value = '';
    pendingRejectionId.value = null;
};

// View note modal
const openNoteModal = (note: string | null | undefined) => {
    if (!note) return;
    selectedNote.value = note;
    showNoteModal.value = true;
};

const closeNoteModal = () => {
    showNoteModal.value = false;
    selectedNote.value = null;
};

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
        IN_PERSON: t('academy.type.in_person'),
        ONLINE: t('academy.type.online'),
        HYBRID: t('academy.type.hybrid'),
    };
    return typeMap[type] || type;
};

// Get full name from attendee
const getFullName = (attendee: PendingRegistration['attendee']): string => {
    if (!attendee) return '';
    return `${attendee.firstName || ''} ${attendee.lastName || ''}`.trim() || '';
};

// Get status label
const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        PENDING: t('academy.dashboard.pending'),
        APPROVED: t('academy.dashboard.approved'),
        REJECTED: t('academy.dashboard.rejected'),
    };
    return statusMap[status] || status;
};
</script>

<template>
    <div
        id="pending-registrations-table"
        class="flex flex-col gap-4"
    >
        <div>
            <div class="flex items-center gap-3">
                <Icon
                    name="solar:clock-circle-bold"
                    class="!size-5 shrink-0 text-muted-foreground"
                />
                <h3 class="text-base font-medium">
                    {{ t('academy.dashboard.recent_registrations') }}
                </h3>
            </div>
            <p class="text-xs">
                {{ t('academy.dashboard.recent_registrations_description') }}
            </p>
        </div>

        <!-- Loading State -->
        <div
            v-if="pending"
            class="space-y-3"
        >
            <Skeleton
                v-for="i in 3"
                :key="i"
                class="h-16 w-full"
            />
        </div>

        <!-- Error State -->
        <div
            v-else-if="error"
            class="text-center py-8"
        >
            <p class="text-destructive font-medium">
                {{ t('common.error.loading_failed') }}
            </p>
            <p class="text-sm text-muted-foreground mt-2">
                {{ error?.message || error?.data?.message || t('common.error.generic') }}
            </p>
        </div>

        <!-- Empty State -->
        <PageEmptyState
            v-else-if="!registrations || registrations.length === 0"
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
                        <div class="font-medium">
                            {{ formatDateShort(row.event.schedules[0]?.date) }}
                        </div>
                        <template v-if="row.event.schedules.length > 1">
                            <Icon
                                name="solar:arrow-right-bold-duotone"
                                class="size-5 shrink-0 opacity-75"
                            />
                            <div class="font-medium">
                                {{ formatDateShort(row.event.schedules[(row.event.schedules.length - 1)]?.date) }}
                            </div>
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
                                        v-if="row.attendee?.avatar"
                                        class="bg-background"
                                        :src="row.attendee.avatar"
                                        :alt="getFullName(row.attendee) || 'User'"
                                    />
                                    <AvatarFallback class="rounded-full bg-background">
                                        {{ useInitials(getFullName(row.attendee)) }}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <div class="font-medium">
                                        {{ getFullName(row.attendee) }}
                                    </div>
                                    <Tooltip
                                        v-if="row.notes && row.notes.trim()"
                                    >
                                        <TooltipTrigger as-child>
                                            <Icon
                                                name="solar:chat-line-linear"
                                                class="!size-4 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                @click="openNoteModal(row.notes)"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent
                                            class="max-w-xs"
                                        >
                                            <p class="whitespace-pre-wrap">
                                                {{ row.notes }}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div class="text-muted-foreground text-xs">
                                    {{ row.attendee.email }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #cell-employment="{ row }">
                <template v-if="row.attendee?.isEmployee">
                    <div class="flex flex-col max-w-[200px]">
                        <div
                            v-if="row.attendee?.occupation?.name"
                            class="font-medium truncate"
                        >
                            {{ row.attendee.occupation.name }}
                        </div>
                        <div
                            v-if="row.attendee?.group?.name"
                            class="text-muted-foreground truncate text-sm"
                        >
                            {{ row.attendee.group.name }}
                        </div>
                    </div>
                </template>
                <span
                    v-else
                    class="text-muted-foreground"
                >—</span>
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
                        <Button
                            :title="$t('action.view') + ' ' + $t('academy.singular')"
                            variant="ghost"
                            size="icon"
                        >
                            <Icon
                                name="solar:eye-outline"
                                class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                            />
                        </Button>
                    </NuxtLink>
                    <NuxtLink :to="`/events/attendees/${row.attendee.id}`">
                        <Button
                            :title="$t('action.view') + ' ' + $t('attendee.singular')"
                            variant="ghost"
                            size="icon"
                        >
                            <Icon
                                name="solar:user-outline"
                                class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                            />
                        </Button>
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
                                    :value="status"
                                    :class="getStatusClass(status, row.registrationStatus)"
                                    :disabled="loadingStates[row.id]"
                                    @click="changeStatus(row.id, status as 'PENDING' | 'APPROVED' | 'REJECTED')"
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
        <Dialog v-model:open="showRejectionModal">
            <DialogContent class="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{{ $t('event.rejected') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('event.status_note_placeholder') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="py-4">
                    <Textarea
                        v-model="rejectionNote"
                        :placeholder="$t('event.status_note_placeholder')"
                        :rows="4"
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        @click="cancelRejection"
                    >
                        {{ $t('common.cancel') }}
                    </Button>
                    <Button
                        variant="destructive"
                        :disabled="loadingStates[pendingRejectionId || '']"
                        @click="confirmRejection"
                    >
                        {{ $t('common.confirm') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog v-model:open="showNoteModal">
            <DialogContent class="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{{ $t('event.status_note') }}</DialogTitle>
                </DialogHeader>
                <div class="py-4">
                    <p class="text-sm whitespace-pre-wrap">{{ selectedNote }}</p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        @click="closeNoteModal"
                    >
                        {{ $t('global.close') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

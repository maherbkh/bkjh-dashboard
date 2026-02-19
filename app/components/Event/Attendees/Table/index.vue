<script setup lang="ts">
import { useInitials } from '@/composables/useInitials';
import { toast } from 'vue-sonner';
import { useDebounceFn } from '@vueuse/core';
import { z } from 'zod';
import type { Certificate } from '~/composables/useCertificateDownload';
import type { RegistrationAnswer } from '~/types';
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
const { formatDateParts } = useGermanDateFormat();
const { downloadCertificate } = useCertificateDownload();

interface EventRegistrationLite {
    id?: string | number;
    status?: string;
    workshopId?: string | null;
    registrationDate?: string;
    hasAttended?: boolean;
    certificate?: Certificate | null;
    notes?: string | null;
    answers?: RegistrationAnswer[];
    attendee?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        email?: string;
        isEmployee?: boolean;
        group?: { id?: string; name?: string } | null;
        occupation?: { id?: string; name?: string } | null;
    };
}

const props = defineProps<{
    data: EventRegistrationLite[];
    eventId?: string;
    eventTitle?: string;
    isEventCollection?: boolean;
    workshopFilter?: string | null;
    hasQuestions?: boolean;
}>();

const emit = defineEmits<{
    reload: [];
}>();

const headerItems = computed(() => [
    { as: 'th' as const, name: t('attendee.person'), id: 'person' },
    { as: 'th' as const, name: t('attendee.employment_details'), id: 'employment' },
    { as: 'th' as const, name: t('attendee.registration_info'), id: 'registration' },
]);

// Workshop filter — driven by the parent-controlled workshopFilter prop
const workshopFilteredData = computed(() => {
    if (!props.isEventCollection || !props.workshopFilter) {
        return props.data;
    }
    return props.data.filter(item => item.workshopId === props.workshopFilter);
});

const selectedStatusTab = ref<string>('ALL');

const selectStatusTab = (status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => {
    selectedStatusTab.value = status;
};

const filteredData = computed(() => {
    return workshopFilteredData.value.filter((item: EventRegistrationLite) => {
        switch (selectedStatusTab.value) {
            case 'ALL':
                return true;
            case 'PENDING':
                return item.status === 'PENDING';
            case 'APPROVED':
                return item.status === 'APPROVED';
            case 'REJECTED':
                return item.status === 'REJECTED';
        }
    });
});

// Status counts reflect the active workshop filter
const statusCounts = computed(() => {
    const base = workshopFilteredData.value;
    return {
        all: base.length,
        pending: base.filter((item: EventRegistrationLite) => item.status === 'PENDING').length,
        approved: base.filter((item: EventRegistrationLite) => item.status === 'APPROVED').length,
        rejected: base.filter((item: EventRegistrationLite) => item.status === 'REJECTED').length,
    };
});

// Computed property for rows with selection state to avoid recalculating on every render
const tableRows = computed(() => {
    return filteredData.value.map((item: EventRegistrationLite) => ({
        ...item,
        selected: item.id !== undefined && selectedRows.value.includes(String(item.id)),
    }));
});
const statuses = ref<string[]>(['PENDING', 'APPROVED', 'REJECTED']);
const loadingStates = ref<Record<string, boolean>>({});

// Attendance update loading state
const isUpdatingAttendance = ref(false);

// Selection state
const selectedRows = ref<string[]>([]);

// Rejection modal state
const showRejectionModal = ref(false);
const rejectionNote = ref('');
const pendingRejectionId = ref<string | null>(null);

// Note view modal state
const showNoteModal = ref(false);
const selectedNote = ref<string | null>(null);

// Reset selected rows when status tab changes
watch(selectedStatusTab, () => {
    selectedRows.value = [];
});

// Reset status tab and selection when parent changes the workshop filter
watch(() => props.workshopFilter, () => {
    selectedRows.value = [];
    selectedStatusTab.value = 'ALL';
});

// Computed property to check if all filtered rows are selected
const isAllSelected = computed(() => {
    if (!filteredData.value.length) return false;
    return filteredData.value.every((item: EventRegistrationLite) => {
        if (!item.id) return false;
        return selectedRows.value.includes(String(item.id));
    });
});

// Debounced status change function
const changeStatus = useDebounceFn(async (id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    if (loadingStates.value[id]) return; // Prevent multiple calls for same item

    // Find the current registration to check its status
    const registration = props.data.find(item => String(item.id) === id);
    const currentStatus = registration?.status;

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
        const { data, error } = await useApiFetch(`/academy/events/registrations/${id}/status`, {
            method: 'PATCH',
            body: {
                status: status,
                note: null,
            },
        });

        if (error.value) {
            toast.error(error.value.message);
        }
        else if (data.value) {
            toast.success(data.value.message as string);
            // Optimistic update - find and update the item in the data array
            const itemIndex = props.data.findIndex(item => item.id === id);
            if (itemIndex !== -1 && props.data[itemIndex]) {
                props.data[itemIndex]!.status = status;
            }
            // Emit reload event to parent
            emit('reload');
        }
    }
    catch (err) {
        toast.error(t('global.messages.error'));
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
        const { data, error } = await useApiFetch(`/academy/events/registrations/${id}/status`, {
            method: 'PATCH',
            body: {
                status: 'REJECTED',
                note: rejectionNote.value.trim() || null,
            },
        });

        if (error.value) {
            toast.error(error.value.message);
        }
        else if (data.value) {
            toast.success(data.value.message as string);
            // Optimistic update - find and update the item in the data array
            const itemIndex = props.data.findIndex(item => item.id === id);
            if (itemIndex !== -1 && props.data[itemIndex]) {
                props.data[itemIndex]!.status = 'REJECTED';
            }
            // Emit reload event to parent
            emit('reload');
            // Close modal and reset state
            showRejectionModal.value = false;
            rejectionNote.value = '';
            pendingRejectionId.value = null;
        }
    }
    catch (err) {
        toast.error(t('global.messages.error'));
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

// Answers modal state
const showAnswersModal = ref(false);
const selectedAnswers = ref<RegistrationAnswer[]>([]);
const selectedAttendeeName = ref('');

const openAnswersModal = (row: EventRegistrationLite) => {
    selectedAnswers.value = row.answers ?? [];
    selectedAttendeeName.value = row.attendee?.fullName ?? row.attendee?.email ?? '';
    showAnswersModal.value = true;
};

const closeAnswersModal = () => {
    showAnswersModal.value = false;
    selectedAnswers.value = [];
    selectedAttendeeName.value = '';
};

const getAnswerTypeLabel = (type: string): string => {
    return t(`event.questions.types.${type.toLowerCase()}`);
};

// Helper function to translate status values
const getStatusLabel = (status: string) => {
    switch (status) {
        case 'ALL':
            return t('academy.all');
        case 'PENDING':
            return t('academy.pending');
        case 'APPROVED':
            return t('event.approved');
        case 'REJECTED':
            return t('event.rejected');
        default:
            return status;
    }
};

// Computed class function for better performance
const getStatusClass = (status: string, rowStatus: string) => {
    if (status === rowStatus) {
        return ['opacity-50 cursor-not-allowed'];
    }
    const baseClasses = 'cursor-pointer hover:bg-accent';
    const conditionalClasses = [];
    if (status === 'PENDING') conditionalClasses.push('text-muted-foreground');
    if (status === 'APPROVED') conditionalClasses.push('hover:!bg-success/10 hover:!text-success');
    if (status === 'REJECTED') conditionalClasses.push('hover:!bg-destructive/10 hover:!text-destructive');
    return [baseClasses, ...conditionalClasses];
};

// Selection handlers
const handleSelectAll = (checked: boolean) => {
    if (checked) {
        // Select all filtered attendees
        const allIds = filteredData.value
            .filter((item: EventRegistrationLite) => item.id !== undefined)
            .map((item: EventRegistrationLite) => String(item.id));
        // Use Set for O(1) lookup when merging
        const existingSet = new Set(selectedRows.value);
        allIds.forEach(id => existingSet.add(id));
        selectedRows.value = Array.from(existingSet);
    }
    else {
        // Deselect all filtered attendees - use Set for O(1) lookup
        const filteredIdsSet = new Set(
            filteredData.value
                .filter((item: EventRegistrationLite) => item.id !== undefined)
                .map((item: EventRegistrationLite) => String(item.id)),
        );
        selectedRows.value = selectedRows.value.filter(id => !filteredIdsSet.has(id));
    }
};

const handleRowSelected = (id: string, checked: boolean) => {
    const idString = String(id);
    if (checked) {
        if (!selectedRows.value.includes(idString)) {
            selectedRows.value.push(idString);
        }
    }
    else {
        const index = selectedRows.value.indexOf(idString);
        if (index > -1) {
            selectedRows.value.splice(index, 1);
        }
    }
};

// Zod schema for attendance validation
const attendanceValidationSchema = z.object({
    attendeeId: z.string(),
    hasAttended: z.boolean(),
    registrationStatus: z.literal('APPROVED'),
    attendeeName: z.string().optional(),
});

// Update attendance for selected attendees
const updateAttendance = async (hasAttended: boolean) => {
    if (!props.eventId || selectedRows.value.length === 0) return;

    // Validate all selected attendees have APPROVED status
    const invalidAttendees: Array<{ name: string; status: string }> = [];
    const validAttendees: Array<{ attendeeId: string; hasAttended: boolean }> = [];

    selectedRows.value.forEach((registrationId) => {
        const registration = props.data.find(item => String(item.id) === registrationId);
        if (!registration || !registration.attendee?.id) {
            return;
        }

        const attendeeData = {
            attendeeId: registration.attendee.id,
            hasAttended,
            registrationStatus: registration.status || '',
            attendeeName: registration.attendee.fullName,
        };

        const validationResult = attendanceValidationSchema.safeParse(attendeeData);

        if (!validationResult.success) {
            // Status is not APPROVED
            invalidAttendees.push({
                name: registration.attendee.fullName || registration.attendee.email || 'Unknown',
                status: registration.status || 'UNKNOWN',
            });
        }
        else {
            validAttendees.push({
                attendeeId: registration.attendee.id,
                hasAttended,
            });
        }
    });

    // Show toast errors for each invalid attendee
    if (invalidAttendees.length > 0) {
        invalidAttendees.forEach((attendee) => {
            const statusLabel = getStatusLabel(attendee.status);
            toast.error(
                `${attendee.name}: ${t('attendee.attendance_update_validation_error', { status: statusLabel })}`,
            );
        });
        return;
    }

    if (validAttendees.length === 0) {
        toast.error(t('global.messages.error'));
        return;
    }

    isUpdatingAttendance.value = true;

    try {
        const { data, error } = await useApiFetch(`/academy/events/${props.eventId}/attendees/attendance`, {
            method: 'PATCH',
            body: {
                attendees: validAttendees,
            },
        });

        if (error.value) {
            toast.error(error.value.message || t('global.messages.error'));
        }
        else if (data.value) {
            toast.success(data.value.message as string || t('global.messages.success'));
            // Clear selection after successful update
            selectedRows.value = [];
            // Emit reload to refresh the data
            emit('reload');
        }
    }
    catch (err) {
        console.error('Error updating attendance:', err);
        toast.error(t('global.messages.error'));
    }
    finally {
        isUpdatingAttendance.value = false;
    }
};
</script>

<template>
    <div
        id="attendees-table"
        class="flex flex-col gap-4"
    >
        <div>
            <ul class="grid lg:grid-cols-4 gap-4">
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'ALL' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('ALL')"
                    >
                        {{ $t('academy.all') }} ({{ statusCounts.all }})
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'PENDING' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('PENDING')"
                    >
                        {{ $t('academy.pending') }} ({{ statusCounts.pending }})
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'APPROVED' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('APPROVED')"
                    >
                        {{ $t('event.approved') }} ({{ statusCounts.approved }})
                    </Button>
                </li>
                <li>
                    <Button
                        class="w-full"
                        :variant="selectedStatusTab === 'REJECTED' ? 'default' : 'outline'"
                        size="sm"
                        @click="selectStatusTab('REJECTED')"
                    >
                        {{ $t('event.rejected') }} ({{ statusCounts.rejected }})
                    </Button>
                </li>
            </ul>
        </div>
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div
                v-if="selectedRows.length > 0"
                class="flex items-center justify-between gap-5 px-2.5 py-2 rounded-full border"
            >
                <div class="flex items-center justify-start gap-5">
                    <Button
                        variant="success"
                        size="sm"
                        :disabled="isUpdatingAttendance"
                        @click="updateAttendance(true)"
                    >
                        <Icon
                            name="solar:check-circle-line-duotone"
                            class="!size-5 shrink-0"
                        />
                        {{ $t('attendee.has_attended') }}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        :disabled="isUpdatingAttendance"
                        @click="updateAttendance(false)"
                    >
                        <Icon
                            name="solar:close-circle-line-duotone"
                            class="!size-5 shrink-0"
                        />
                        {{ $t('attendee.has_not_attended') }}
                    </Button>
                </div>
                <div class="text-muted-foreground text-sm font-medium mr-2">
                    {{ $t('attendee.total_selected') }}: {{ selectedRows.length }}
                </div>
            </div>
        </Transition>
        <div
            class="transition-all duration-300 ease-out"
            :class="selectedRows.length > 0 ? 'mt-4' : 'mt-0'"
        >
            <PageEmptyState
                v-if="filteredData.length === 0"
                :search-query="''"
                :add-new-text="$t('attendee.plural')"
                :no-add-new-text="false"
            />
            <PageTable
                v-else
                :header-items="headerItems"
                :rows="tableRows"
                :selected-rows="selectedRows"
                :loading="false"
                :skeleton-rows="3"
                :selectable="true"
                :sortable="false"
                :model-value="isAllSelected"
                @row-selected="(id: number | string, checked: boolean) => handleRowSelected(String(id), checked)"
                @update:selected-rows="(rows: (string | number)[]) => {
                    selectedRows = rows.map(String);
                }"
                @update:model-value="handleSelectAll"
            >
                <template #cell-person="{ row }">
                    <div class="flex flex-col">
                        <div>
                            <div class="flex items-start gap-2">
                                <div>
                                    <Icon
                                        :name="row.hasAttended ? 'solar:check-circle-line-duotone' : 'solar:close-circle-line-duotone'"
                                        :class="[
                                            '!size-9 shrink-0',
                                            row.hasAttended ? 'text-success' : 'text-muted-foreground',
                                        ]"
                                        :title="row.hasAttended ? $t('attendee.has_attended') : $t('attendee.has_not_attended')"
                                    />
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <div class="font-medium">
                                            {{ row.attendee?.fullName }}
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
                                        {{ row.attendee?.email }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #cell-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <!-- Answers icon — shown when the event has questions and this registration has answers -->
                        <Tooltip v-if="hasQuestions && row.answers && row.answers.length > 0">
                            <TooltipTrigger as-child>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    @click="openAnswersModal(row)"
                                >
                                    <Icon
                                        name="solar:clipboard-list-linear"
                                        class="group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 opacity-80 shrink-0 group-hover:text-primary"
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {{ $t('event.view_answers') }}
                            </TooltipContent>
                        </Tooltip>
                        <NuxtLink :to="`/events/attendees/${row.attendee?.id}`">
                            <LazyButton
                                :title="$t('action.view')"
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
                        <LazyButton
                            :title="
                                row.hasAttended && row.certificate
                                    ? $t('event.download_certificate')
                                    : $t('event.certificate_not_available')
                            "
                            variant="ghost"
                            size="icon"
                            :disabled="!row.hasAttended || !row.certificate"
                            hydrate-on-interaction="mouseover"
                            @click="
                                row.certificate
                                    && downloadCertificate(row.certificate, {
                                        attendeeName: row.attendee?.fullName,
                                        eventTitle: props.eventTitle,
                                    })
                            "
                        >
                            <Icon
                                name="solar:diploma-outline"
                                :class="[
                                    'group-hover:opacity-100 group-hover:scale-110 ease-in-out duration-300 !size-5 shrink-0',
                                    row.hasAttended && row.certificate
                                        ? 'opacity-80 group-hover:text-primary'
                                        : 'opacity-40 cursor-not-allowed',
                                ]"
                            />
                        </LazyButton>
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
                                <DropdownMenuRadioGroup v-model="row.status">
                                    <DropdownMenuRadioItem
                                        v-for="status in statuses"
                                        :key="status"
                                        :value="status"
                                        :class="getStatusClass(status, row.status)"
                                        :disabled="loadingStates[row.id as string] || status === row.status"
                                        @click="changeStatus(row.id as string, status as 'PENDING' | 'APPROVED' | 'REJECTED')"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span>{{ getStatusLabel(status) }}</span>
                                            <Icon
                                                v-if="loadingStates[row.id as string]"
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
                                {{ formatDateParts(row.registrationDate).date }}
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
                                {{ formatDateParts(row.registrationDate).time }}
                            </div>
                        </div>
                        <div class="mt-1">
                            <Badge
                                :variant="row.status === 'APPROVED' ? 'success' : row.status === 'PENDING' ? 'pending' : 'destructive'"
                                class="w-fit"
                            >
                                {{ getStatusLabel(row.status || '') }}
                            </Badge>
                        </div>
                    </div>
                </template>
            </PageTable>
        </div>
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
                    <p class="text-sm whitespace-pre-wrap">
                        {{ selectedNote }}
                    </p>
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

        <!-- Registration Answers Modal -->
        <Dialog v-model:open="showAnswersModal">
            <DialogContent class="max-w-xl">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <Icon
                            name="solar:clipboard-list-linear"
                            class="size-5! shrink-0 opacity-75"
                        />
                        {{ $t('event.registration_answers') }}
                    </DialogTitle>
                    <DialogDescription v-if="selectedAttendeeName">
                        {{ selectedAttendeeName }}
                    </DialogDescription>
                </DialogHeader>
                <div class="py-2 flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    <div
                        v-for="(answer, index) in selectedAnswers"
                        :key="answer.id ?? index"
                        class="rounded-lg border bg-muted/40 px-4 py-3 flex flex-col gap-1"
                    >
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium leading-snug">{{ answer.label }}</span>
                            <Badge
                                variant="outline"
                                class="text-xs shrink-0 ml-auto"
                            >
                                {{ getAnswerTypeLabel(answer.type) }}
                            </Badge>
                        </div>
                        <p class="text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word">
                            {{ answer.value || '—' }}
                        </p>
                    </div>
                    <div
                        v-if="selectedAnswers.length === 0"
                        class="text-sm text-muted-foreground text-center py-4"
                    >
                        {{ $t('global.no_data') }}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        @click="closeAnswersModal"
                    >
                        {{ $t('global.close') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

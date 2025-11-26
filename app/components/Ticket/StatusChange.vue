<!--
  TicketStatusChange Component

  Standalone component for changing ticket status with optional note.

  Props:
  - ticketId: string - The ticket UUID
  - currentStatus: string - The current/last status of the ticket (to disable in dropdown)
  - isLoading?: boolean - Optional external loading state

  Emits:
  - status-changed: Triggered after successful status change (parent can refresh data)
  - error: Triggered on error (optional)
-->

<template>
    <div>
        <!-- Status Change Dropdown Button -->
        <DropdownMenu>
            <DropdownMenuTrigger class="lg:w-fit w-full">
                <Button
                    class="group lg:w-fit w-full"
                    :title="$t('ticket.change_status')"
                    variant="default"
                    :disabled="isInternalLoading || isLoading"
                >
                    <Icon
                        name="solar:check-circle-outline"
                        class="shrink-0"
                    />
                    {{ $t('ticket.change_status') }}
                    <Icon
                        name="solar:double-alt-arrow-down-line-duotone"
                        class="ml-2 h-4 w-4 group-hover:rotate-90 ease-in-out duration-300"
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                class="w-56"
            >
                <DropdownMenuLabel>{{ $t('common.status') }}</DropdownMenuLabel>
                <DropdownMenuItem
                    v-for="status in availableStatuses"
                    :key="status"
                    :disabled="status === currentStatus || isInternalLoading || isLoading"
                    @click="handleStatusSelect(status)"
                >
                    <Icon
                        :name="getStatusIcon(status)"
                        class="shrink-0 mr-2"
                    />
                    {{ $t(`ticket.status.${status.toLowerCase()}`) }}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <!-- Status Change Dialog -->
        <Dialog
            :open="isDialogOpen"
            @update:open="isDialogOpen = $event"
        >
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{ $t('ticket.status_change_dialog_title') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('ticket.status_change_dialog_description') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="status-note">{{ $t('ticket.status_note') }}</Label>
                        <Textarea
                            id="status-note"
                            v-model="statusNote"
                            :placeholder="$t('ticket.status_note_placeholder')"
                            rows="3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        :disabled="isInternalLoading"
                        @click="isDialogOpen = false"
                    >
                        {{ $t('action.cancel') }}
                    </Button>
                    <Button
                        :disabled="isInternalLoading"
                        @click="submitStatusChange"
                    >
                        <Icon
                            v-if="isInternalLoading"
                            name="solar:refresh-linear"
                            class="mr-2 h-4 w-4 animate-spin"
                        />
                        {{ $t('ticket.change_status') }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script lang="ts" setup>
import { toast } from 'vue-sonner';
import type { TicketStatusChangePayload } from '~/types';

interface Props {
    ticketId: string;
    currentStatus: string;
    isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
});

const emit = defineEmits<{
    'status-changed': [];
    'error': [error: any];
}>();

const { t } = useI18n();

// Available status options
const availableStatuses: Array<'PENDING' | 'IN_PROGRESS' | 'PENDING_ACTION' | 'TRANSFERRED' | 'SOLVED' | 'CLOSED'> = [
    'PENDING',
    'IN_PROGRESS',
    'PENDING_ACTION',
    'TRANSFERRED',
    'SOLVED',
    'CLOSED',
];

// Internal state
const isDialogOpen = ref(false);
const selectedStatus = ref<string>('');
const statusNote = ref('');
const isInternalLoading = ref(false);

// Handle status selection from dropdown
const handleStatusSelect = (status: string) => {
    selectedStatus.value = status;
    statusNote.value = '';
    isDialogOpen.value = true;
};

// Get status icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'solar:clock-circle-outline';
        case 'IN_PROGRESS':
            return 'solar:play-circle-outline';
        case 'PENDING_ACTION':
            return 'solar:pause-circle-outline';
        case 'TRANSFERRED':
            return 'solar:transfer-horizontal-outline';
        case 'SOLVED':
            return 'solar:check-circle-outline';
        case 'CLOSED':
            return 'solar:close-circle-outline';
        default:
            return 'solar:check-circle-outline';
    }
};

// Submit status change
const submitStatusChange = async () => {
    if (!selectedStatus.value) return;

    isInternalLoading.value = true;
    try {
        const payload: TicketStatusChangePayload = {
            status: selectedStatus.value as TicketStatusChangePayload['status'],
        };

        // Only include note if it's not empty
        if (statusNote.value && statusNote.value.trim()) {
            payload.note = statusNote.value.trim();
        }

        await useApiFetch(`/support/tickets/${props.ticketId}/status`, {
            method: 'POST',
            body: payload,
        });

        toast.success(t('ticket.status_updated_successfully'));
        isDialogOpen.value = false;
        statusNote.value = '';
        selectedStatus.value = '';

        // Emit event for parent to refresh data
        emit('status-changed');
    }
    catch (error: any) {
        console.error('Error changing ticket status:', error);
        const errorMessage = error?.data?.message || error?.message || t('ticket.status_update_failed');
        toast.error(errorMessage);
        emit('error', error);
    }
    finally {
        isInternalLoading.value = false;
    }
};
</script>


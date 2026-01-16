<!--
  TicketStatusChange Component

  Standalone component for changing ticket status with optional note and email notification.

  Props:
  - ticketId: string - The ticket UUID
  - currentStatus: string - The current/last status of the ticket (to disable in dropdown)
  - isLoading?: boolean - Optional external loading state
  - requesterEmail?: string - The ticket requester's email address

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
            @update:open="(value) => { isDialogOpen = value; if (!value) { statusNote = ''; sendEmail = false; emailOption = 'requester'; customEmails = ''; emailError = ''; noteError = ''; } }"
        >
            <DialogContent class="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{{ $t('ticket.status_change_dialog_title') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('ticket.status_change_dialog_description') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="status-note">{{ $t('ticket.status_note') }}</Label>
                        <RTEditor
                            id="status-note"
                            v-model="statusNote"
                            :placeholder="$t('ticket.status_note_placeholder')"
                            :show-character-count="false"
                            min-height="150px"
                            class="w-full"
                            :errors="noteError ? [noteError] : []"
                            @input="noteError = ''"
                        />
                        <p
                            v-if="noteError"
                            class="text-sm text-red-500"
                        >
                            {{ noteError }}
                        </p>
                    </div>

                    <!-- Email Notification Section (only for CLOSED, SOLVED, PENDING_ACTION) -->
                    <TransitionExpand>
                        <div
                            v-if="shouldShowEmailOptions"
                            class="space-y-3"
                        >
                            <FormItemSwitch
                                id="send-email"
                                v-model="sendEmail"
                                flex-row
                                :show-side-label="false"
                                :title="$t('ticket.send_email')"
                            />

                            <!-- Email Options (shown when sendEmail is true) -->
                            <TransitionExpand>
                                <div
                                    v-if="sendEmail"
                                    class="space-y-3"
                                >
                                    <!-- Email Status Notice (only for requester email) -->
                                    <TransitionSlide>
                                        <div
                                            v-if="props.requesterEmail"
                                            :class="cn(
                                                'rounded-md px-3 py-2 text-sm font-normal',
                                                isInternalEmail(props.requesterEmail)
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-400/25'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-400/25',
                                            )"
                                        >
                                            <div class="flex items-center gap-2">
                                                <Icon
                                                    :name="isInternalEmail(props.requesterEmail) ? 'solar:shield-check-outline' : 'solar:shield-cross-outline'"
                                                    class="size-5! shrink-0"
                                                />
                                                <span>
                                                    {{ isInternalEmail(props.requesterEmail) ? t('ticket.internal_email') : t('ticket.external_email') }}
                                                </span>
                                            </div>
                                        </div>
                                    </TransitionSlide>

                                    <FormItemRadioGroup
                                        id="email-recipient"
                                        v-model="emailOption"
                                        :options="emailOptions"
                                        variant="box"
                                    />

                                    <!-- Custom Email Input (shown when "other" is selected) -->
                                    <TransitionSlide>
                                        <div
                                            v-if="emailOption === 'other'"
                                            class="space-y-2"
                                        >
                                            <Label for="custom-emails">{{ $t('ticket.custom_email_addresses') }}</Label>
                                            <Input
                                                id="custom-emails"
                                                v-model="customEmails"
                                                type="text"
                                                :placeholder="$t('ticket.custom_email_addresses_placeholder')"
                                                :class="{ 'border-red-500': emailError }"
                                                @input="emailError = ''"
                                            />
                                            <p
                                                v-if="emailError"
                                                class="text-sm text-red-500"
                                            >
                                                {{ emailError }}
                                            </p>
                                        </div>
                                    </TransitionSlide>
                                </div>
                            </TransitionExpand>
                        </div>
                    </TransitionExpand>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        :disabled="isInternalLoading"
                        @click="() => { isDialogOpen = false; statusNote = ''; sendEmail = false; emailOption = 'requester'; customEmails = ''; emailError = ''; noteError = ''; }"
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
import { cn } from '@/lib/utils';
import { toast } from 'vue-sonner';
import { TransitionExpand, TransitionSlide } from '@morev/vue-transitions';
import type { TicketStatusChangePayload } from '~/types';
import RTEditor from '~/components/FormItem/RTEditor.vue';

interface Props {
    ticketId: string;
    currentStatus: string;
    isLoading?: boolean;
    requesterEmail?: string;
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

// Email notification state
const sendEmail = ref(false);
const emailOption = ref<'requester' | 'other'>('requester');
const customEmails = ref('');
const emailError = ref('');
const noteError = ref('');

// Check if email options should be shown for the selected status
const shouldShowEmailOptions = computed(() => {
    return ['CLOSED', 'SOLVED', 'PENDING_ACTION'].includes(selectedStatus.value);
});

// Watch for email options visibility and reset sendEmail when shown
watch(shouldShowEmailOptions, (newValue) => {
    if (newValue) {
        sendEmail.value = false;
    }
});

// Handle status selection from dropdown
const handleStatusSelect = (status: string) => {
    selectedStatus.value = status;
    statusNote.value = '';
    sendEmail.value = false;
    emailOption.value = 'requester';
    customEmails.value = '';
    emailError.value = '';
    noteError.value = '';
    isDialogOpen.value = true;
};

// Allowed internal email domains
const internalEmailDomains = [
    'backhaus-blog.de',
    'backhaus.de',
    'backhaus.firma.cc',
    'backhaus-informiert.de',
    'backhaus-jugendhilfe.com',
    'backhaus-jugendhilfe.de',
    'backhaus-kinderhilfe.com',
    'backhaus-kinderhilfe.de',
    'backhaus-profifamilie.de',
    'bkjh.de',
    'bkjh-news.de',
    'gerhardbackhaus.com',
    'gerhard-backhaus.com',
    'gerhardbackhaus.de',
    'gerhard-backhaus.de',
    'kind-im-mittelpunkt.com',
    'kind-im-mittelpunkt.de',
    'kind-im-mittelpunkt.info',
    'mariannebackhaus.com',
    'marianne-backhaus.com',
    'mariannebackhaus.de',
    'marianne-backhaus.de',
    'marianne-backhaus.eu',
    'pflegefamilie.de',
    'profifamilie.com',
    'profifamilie.de',
    'profifamilie.eu',
    'profifamilie.info',
    'profifamilie.net',
    'profifamilie.org',
    'sebastianbackhaus.com',
    'sebastian-backhaus.com',
    'sebastian-backhaus.de',
    'backhaus-akademie.de',
];

// Check if email is internal
const isInternalEmail = (email: string | undefined): boolean => {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? internalEmailDomains.includes(domain) : false;
};

// Email validation function
const validateEmails = (emailString: string): boolean => {
    if (!emailString.trim()) return false;

    const emails = emailString.split(',').map(e => e.trim().toLowerCase());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emails.every(email => emailRegex.test(email));
};

// Email options for RadioGroup
const emailOptions = computed(() => [
    {
        value: 'requester' as const,
        label: props.requesterEmail || t('ticket.requester_email'),
        description: t('ticket.send_to_requester'),
        icon: 'solar:user-circle-line-duotone',
    },
    {
        value: 'other' as const,
        label: t('ticket.other_email'),
        description: t('ticket.send_to_custom_email'),
        icon: 'solar:letter-unread-line-duotone',
    },
]);

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

    // Validate note if sendEmail is true (for applicable statuses)
    if (shouldShowEmailOptions.value && sendEmail.value) {
        if (!statusNote.value.trim()) {
            noteError.value = t('ticket.note_required');
            return;
        }
    }

    // Validate email if "other" is selected and email options should be shown
    if (shouldShowEmailOptions.value && sendEmail.value && emailOption.value === 'other') {
        if (!customEmails.value.trim()) {
            emailError.value = t('ticket.email_required');
            return;
        }
        if (!validateEmails(customEmails.value)) {
            emailError.value = t('ticket.email_invalid');
            return;
        }
    }

    isInternalLoading.value = true;
    try {
        const payload: TicketStatusChangePayload = {
            status: selectedStatus.value as TicketStatusChangePayload['status'],
        };

        // Only include note if it's not empty
        if (statusNote.value && statusNote.value.trim()) {
            payload.note = statusNote.value.trim();
        }

        // Add email fields only for specific statuses (CLOSED, SOLVED, PENDING_ACTION)
        if (shouldShowEmailOptions.value) {
            payload.sendEmail = sendEmail.value;

            // Add email based on selection
            if (sendEmail.value) {
                if (emailOption.value === 'requester') {
                    payload.email = props.requesterEmail;
                }
                else {
                    // Process custom emails: trim, lowercase, and join
                    payload.email = customEmails.value
                        .split(',')
                        .map(e => e.trim().toLowerCase())
                        .join(',');
                }
            }
        }

        await useApiFetch(`/support/tickets/${props.ticketId}/status`, {
            method: 'POST',
            body: payload,
        });

        toast.success(t('ticket.status_updated_successfully'));
        isDialogOpen.value = false;
        statusNote.value = '';
        selectedStatus.value = '';
        sendEmail.value = false;
        emailOption.value = 'requester';
        customEmails.value = '';
        emailError.value = '';
        noteError.value = '';

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

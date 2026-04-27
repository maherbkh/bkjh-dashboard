<script setup lang="ts">
import type { BookingApiStatus, BookingCalendarRecord, BookingGroupOption } from '~/composables/useBookingCalendarView';
import type { BookingActionType, BookingEditForm, BookingEmailOption, BookingStatusOption } from '~/composables/useBookingActions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    open: boolean;
    action: BookingActionType | null;
    booking: BookingCalendarRecord | null;
    statusOptions: BookingStatusOption[];
    groupOptions: BookingGroupOption[];
    pendingStatus: BookingApiStatus;
    statusNote: string;
    sendEmail: boolean;
    emailOption: BookingEmailOption;
    customEmails: string;
    emailError: string;
    showSafeFields: boolean;
    shouldAutoShowSafeFields: boolean;
    isInternalEmail: boolean;
    editForm: BookingEditForm;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false,
});
const { t } = useI18n();
const { formatDate } = useGermanDateFormat();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'update:pending-status', value: BookingApiStatus): void;
    (e: 'update:status-note', value: string): void;
    (e: 'update:send-email', value: boolean): void;
    (e: 'update:email-option', value: BookingEmailOption): void;
    (e: 'update:custom-emails', value: string): void;
    (e: 'update:show-safe-fields', value: boolean): void;
    (e: 'update:edit-form', value: BookingEditForm): void;
    (e: 'confirm'): void;
}>();

const titleKey = computed(() => {
    if (!props.action) return 'booking.calendar.action_dialog.title.edit';
    return `booking.calendar.action_dialog.title.${props.action}`;
});

const descriptionKey = computed(() => {
    if (!props.action) return 'booking.calendar.action_dialog.description.edit';
    return `booking.calendar.action_dialog.description.${props.action}`;
});

const confirmLabelKey = computed(() => {
    if (!props.action) return 'booking.calendar.action_dialog.confirm.edit';
    return `booking.calendar.action_dialog.confirm.${props.action}`;
});

const statusSelectItems = computed(() => {
    return props.statusOptions.map(status => ({
        id: status.value,
        name: status.label || t(`booking.calendar.status_options.${status.value.toLowerCase()}`),
        disabled: status.disabled,
    }));
});

const emailRecipientOptions = computed(() => ([
    {
        value: 'requester' as BookingEmailOption,
        label: props.booking?.requesterEmail || t('booking.calendar.action_dialog.email.requester'),
        description: t('booking.calendar.action_dialog.email.requester_description'),
        icon: 'solar:user-circle-line-duotone',
    },
    {
        value: 'other' as BookingEmailOption,
        label: t('booking.calendar.action_dialog.email.other'),
        description: t('booking.calendar.action_dialog.email.other_description'),
        icon: 'solar:letter-unread-line-duotone',
    },
]));

const statusBadgeVariant = computed(() => {
    if (!props.booking) return 'secondary';

    if (props.booking.status === 'APPROVED') return 'success';
    if (props.booking.status === 'PENDING') return 'pending';
    if (props.booking.status === 'REJECTED') return 'destructive';
    return 'secondary';
});

const groupDisplayName = computed(() => {
    if (!props.booking?.groupId) return '-';
    return props.groupOptions.find(option => option.id === props.booking?.groupId)?.name ?? props.booking.groupId;
});

const formattedStartsAt = computed(() => {
    if (!props.booking?.startsAt) return '-';
    return formatDate(props.booking.startsAt, 'DD.MM.YYYY, HH:mm') || '-';
});

const formattedEndsAt = computed(() => {
    if (!props.booking?.endsAt) return '-';
    return formatDate(props.booking.endsAt, 'DD.MM.YYYY, HH:mm') || '-';
});

const bookingDuration = computed(() => {
    if (!props.booking) return '-';
    const start = new Date(props.booking.startsAt);
    const end = new Date(props.booking.endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return '-';

    const totalMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
});

function updateField<K extends keyof BookingEditForm>(field: K, value: BookingEditForm[K]) {
    emit('update:edit-form', {
        ...props.editForm,
        [field]: value,
    });
}
</script>

<template>
    <Dialog
        :open="open"
        @update:open="emit('update:open', $event)"
    >
        <DialogContent class="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{{ $t(titleKey) }}</DialogTitle>
                <DialogDescription>{{ $t(descriptionKey) }}</DialogDescription>
            </DialogHeader>

            <div class="space-y-4 py-1">
                <div
                    v-if="booking"
                    class="rounded-md border bg-muted/30 p-3 text-sm divide-y divide-dashed divide-muted-foreground/30"
                >
                    <p class="pt-0 pb-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:user-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.requester_name') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ booking.requesterName }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:letter-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.requester_email') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ booking.requesterEmail }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:users-group-rounded-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.group_name') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ groupDisplayName }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:calendar-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.starts_at') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ formattedStartsAt }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:calendar-mark-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.ends_at') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ formattedEndsAt }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:clock-circle-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.duration') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ bookingDuration }}</span>
                    </p>
                    <p class="py-2">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:road-circle-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.distance') }}:
                        </span>
                        <span class="font-semibold ml-3">{{ booking.distance }}</span>
                    </p>
                    <p class="pt-2 pb-0">
                        <span class="font-light inline-flex items-center">
                            <Icon
                                name="solar:clipboard-check-linear"
                                class="size-4 mr-1.5 opacity-75"
                            />
                            {{ $t('booking.calendar.action_dialog.fields.status') }}:
                        </span>
                        <Badge
                            class="ml-3"
                            :variant="statusBadgeVariant"
                        >
                            {{ $t(`booking.calendar.status_options.${booking.status.toLowerCase()}`) }}
                        </Badge>
                    </p>
                </div>

                <template v-if="action === 'change_status'">
                    <div class="space-y-3">
                        <FormItemSelect
                            id="booking-action-status"
                            :model-value="pendingStatus"
                            :title="$t('booking.calendar.action_dialog.fields.status')"
                            :placeholder="$t('action.select') + ' ' + $t('booking.calendar.action_dialog.fields.status')"
                            :data="statusSelectItems"
                            key-value="id"
                            name-value="name"
                            @update:model-value="emit('update:pending-status', $event as BookingApiStatus)"
                        />

                        <FormItemTextarea
                            id="booking-action-status-note"
                            :model-value="statusNote"
                            :title="$t('booking.calendar.action_dialog.fields.note')"
                            :placeholder="$t('booking.calendar.action_dialog.fields.note_placeholder')"
                            :rows="4"
                            @update:model-value="emit('update:status-note', String($event ?? ''))"
                        />

                        <FormItemSwitch
                            id="booking-action-send-email"
                            :model-value="sendEmail"
                            flex-row
                            :show-side-label="false"
                            :title="$t('booking.calendar.action_dialog.fields.send_email')"
                            @update:model-value="emit('update:send-email', Boolean($event))"
                        />

                        <div
                            v-if="sendEmail"
                            class="space-y-3"
                        >
                            <div
                                :class="[
                                    'rounded-md px-3 py-2 text-sm border',
                                    isInternalEmail
                                        ? 'bg-success/10 border-success/25 text-success'
                                        : 'bg-warning/10 border-warning/25 text-warning',
                                ]"
                            >
                                <div class="flex items-center gap-2">
                                    <Icon
                                        :name="isInternalEmail ? 'solar:shield-check-outline' : 'solar:shield-cross-outline'"
                                        class="size-4 shrink-0"
                                    />
                                    <span>
                                        {{ isInternalEmail ? $t('booking.calendar.action_dialog.email.internal') : $t('booking.calendar.action_dialog.email.external') }}
                                    </span>
                                </div>
                            </div>

                            <FormItemRadioGroup
                                id="booking-action-email-option"
                                :model-value="emailOption"
                                :options="emailRecipientOptions"
                                variant="box"
                                @update:model-value="emit('update:email-option', $event as BookingEmailOption)"
                            />

                            <FormItemInput
                                v-if="emailOption === 'other'"
                                id="booking-action-custom-emails"
                                :model-value="customEmails"
                                :title="$t('booking.calendar.action_dialog.email.custom_emails')"
                                :placeholder="$t('booking.calendar.action_dialog.email.custom_emails_placeholder')"
                                :errors="emailError ? [emailError] : []"
                                icon="solar:letter-linear"
                                @update:model-value="emit('update:custom-emails', String($event ?? ''))"
                            />
                        </div>

                        <div
                            v-if="pendingStatus === 'APPROVED' && !shouldAutoShowSafeFields"
                            class="pt-1"
                        >
                            <FormItemSwitch
                                id="booking-action-show-safe-fields"
                                :model-value="showSafeFields"
                                flex-row
                                :show-side-label="false"
                                :title="$t('booking.calendar.action_dialog.fields.show_safe_fields')"
                                @update:model-value="emit('update:show-safe-fields', Boolean($event))"
                            />
                        </div>

                        <div
                            v-if="pendingStatus === 'APPROVED' && (shouldAutoShowSafeFields || showSafeFields)"
                            class="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                            <FormItemInput
                                id="booking-action-status-safe-reference"
                                :model-value="editForm.safeReference"
                                :title="$t('booking.calendar.action_dialog.fields.safe_reference')"
                                icon="solar:folder-open-linear"
                                @update:model-value="updateField('safeReference', String($event ?? ''))"
                            />
                            <FormItemInput
                                id="booking-action-status-safe-pin"
                                :model-value="editForm.safePin"
                                :title="$t('booking.calendar.action_dialog.fields.safe_pin')"
                                icon="solar:key-linear"
                                @update:model-value="updateField('safePin', String($event ?? ''))"
                            />
                        </div>
                    </div>
                </template>

                <template v-else-if="action === 'edit'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormItemDatePicker
                            name="booking-action-starts-at"
                            :label="$t('booking.calendar.action_dialog.fields.starts_at')"
                            :model-value="editForm.startsAt"
                            format="yyyy-MM-dd HH:mm"
                            :time-picker="true"
                            :auto-apply="true"
                            icon="solar:calendar-linear"
                            :placeholder="$t('booking.calendar.action_dialog.fields.starts_at')"
                            @update:model-value="updateField('startsAt', String($event ?? ''))"
                        />
                        <FormItemDatePicker
                            name="booking-action-ends-at"
                            :label="$t('booking.calendar.action_dialog.fields.ends_at')"
                            :model-value="editForm.endsAt"
                            format="yyyy-MM-dd HH:mm"
                            :time-picker="true"
                            :auto-apply="true"
                            icon="solar:calendar-linear"
                            :placeholder="$t('booking.calendar.action_dialog.fields.ends_at')"
                            @update:model-value="updateField('endsAt', String($event ?? ''))"
                        />
                        <FormItemInput
                            id="booking-action-requester-name"
                            :model-value="editForm.requesterName"
                            :title="$t('booking.calendar.action_dialog.fields.requester_name')"
                            icon="solar:user-linear"
                            @update:model-value="updateField('requesterName', String($event ?? ''))"
                        />
                        <FormItemInput
                            id="booking-action-requester-email"
                            type="email"
                            :model-value="editForm.requesterEmail"
                            :title="$t('booking.calendar.action_dialog.fields.requester_email')"
                            icon="solar:letter-linear"
                            @update:model-value="updateField('requesterEmail', String($event ?? ''))"
                        />
                        <FormItemInput
                            id="booking-action-distance"
                            type="number"
                            :model-value="editForm.distance"
                            :title="$t('booking.calendar.action_dialog.fields.distance')"
                            icon="solar:road-circle-linear"
                            @update:model-value="updateField('distance', String($event ?? ''))"
                        />
                        <FormItemTextarea
                            id="booking-action-requester-note"
                            :model-value="editForm.requesterNote"
                            :title="$t('booking.calendar.action_dialog.fields.requester_note')"
                            :rows="3"
                            @update:model-value="updateField('requesterNote', String($event ?? ''))"
                        />
                        <FormItemTextarea
                            id="booking-action-admin-note"
                            :model-value="editForm.adminNote"
                            :title="$t('booking.calendar.action_dialog.fields.admin_note')"
                            :rows="3"
                            @update:model-value="updateField('adminNote', String($event ?? ''))"
                        />
                        <FormItemSelect
                            id="booking-action-group-id"
                            :model-value="editForm.groupId"
                            :title="$t('booking.calendar.action_dialog.fields.group_id')"
                            :placeholder="$t('action.select') + ' ' + $t('booking.calendar.action_dialog.fields.group_id')"
                            :data="groupOptions"
                            key-value="id"
                            name-value="name"
                            :searchable="true"
                            @update:model-value="updateField('groupId', String($event ?? ''))"
                        />
                        <FormItemInput
                            id="booking-action-safe-pin"
                            :model-value="editForm.safePin"
                            :title="$t('booking.calendar.action_dialog.fields.safe_pin')"
                            icon="solar:key-linear"
                            @update:model-value="updateField('safePin', String($event ?? ''))"
                        />
                        <FormItemInput
                            id="booking-action-safe-reference"
                            class="md:col-span-2"
                            :model-value="editForm.safeReference"
                            :title="$t('booking.calendar.action_dialog.fields.safe_reference')"
                            icon="solar:folder-open-linear"
                            @update:model-value="updateField('safeReference', String($event ?? ''))"
                        />
                    </div>
                </template>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    :disabled="isSubmitting"
                    @click="emit('update:open', false)"
                >
                    {{ $t('ui.cancel') }}
                </Button>
                <Button
                    :disabled="isSubmitting"
                    @click="emit('confirm')"
                >
                    {{ $t(confirmLabelKey) }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

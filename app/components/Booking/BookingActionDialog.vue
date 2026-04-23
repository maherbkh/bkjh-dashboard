<script setup lang="ts">
import type { BookingApiStatus, BookingCalendarRecord, BookingGroupOption } from '~/composables/useBookingCalendarView';
import type { BookingActionType, BookingEditForm } from '~/composables/useBookingActions';
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
    statusOptions: BookingApiStatus[];
    groupOptions: BookingGroupOption[];
    pendingStatus: BookingApiStatus;
    editForm: BookingEditForm;
    isSubmitting?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    isSubmitting: false,
});
const { t } = useI18n();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'update:pending-status', value: BookingApiStatus): void;
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
        id: status,
        name: t(`booking.calendar.status_options.${status.toLowerCase()}`),
    }));
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
                    class="rounded-md border bg-muted/30 p-3 text-sm space-y-1"
                >
                    <p><span class="font-medium">{{ $t('booking.calendar.action_dialog.fields.requester_name') }}:</span> {{ booking.requesterName }}</p>
                    <p><span class="font-medium">{{ $t('booking.calendar.action_dialog.fields.requester_email') }}:</span> {{ booking.requesterEmail }}</p>
                    <p><span class="font-medium">{{ $t('booking.calendar.action_dialog.fields.status') }}:</span> {{ $t(`booking.calendar.status_options.${booking.status.toLowerCase()}`) }}</p>
                </div>

                <template v-if="action === 'change_status'">
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

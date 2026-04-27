import type {
    BookingApiStatus,
    BookingCalendarRecord,
} from '~/composables/useBookingCalendarView';

export type BookingActionType = 'edit' | 'change_status' | 'duplicate' | 'cancel';

export type BookingActionSelection = {
    action: BookingActionType;
    bookingId: string;
    nextStatus?: BookingApiStatus;
};

export type BookingEditForm = {
    startsAt: string;
    endsAt: string;
    requesterName: string;
    requesterEmail: string;
    groupId: string;
    safeReference: string;
    safePin: string;
};

type UseBookingActionsOptions = {
    getBookingById: (bookingId: string) => BookingCalendarRecord | null;
    updateBooking: (bookingId: string, patch: Partial<Omit<BookingCalendarRecord, 'id'>>) => BookingCalendarRecord | null;
    changeBookingStatus: (bookingId: string, status: BookingApiStatus) => BookingCalendarRecord | null;
    duplicateBooking: (bookingId: string) => BookingCalendarRecord | null;
    cancelBooking: (bookingId: string) => BookingCalendarRecord | null;
};

function toDateTimeLocalValue(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function useBookingActions(options: UseBookingActionsOptions) {
    const selectedBookingId = ref<string | null>(null);
    const currentAction = ref<BookingActionType | null>(null);
    const isDialogOpen = ref(false);
    const pendingStatus = ref<BookingApiStatus>('PENDING');
    const isSubmitting = ref(false);
    const editForm = ref<BookingEditForm>({
        startsAt: '',
        endsAt: '',
        requesterName: '',
        requesterEmail: '',
        groupId: '',
        safeReference: '',
        safePin: '',
    });

    const selectedBooking = computed(() => {
        if (!selectedBookingId.value) return null;
        return options.getBookingById(selectedBookingId.value);
    });

    const statusTransitions = computed<Record<BookingApiStatus, BookingApiStatus[]>>(() => ({
        PENDING: ['APPROVED', 'REJECTED', 'CANCELED'],
        APPROVED: ['PENDING', 'REJECTED', 'CANCELED'],
        REJECTED: ['PENDING', 'APPROVED', 'CANCELED'],
        CANCELED: ['PENDING', 'APPROVED', 'REJECTED'],
    }));

    const statusOptions = computed<BookingApiStatus[]>(() => {
        const status = selectedBooking.value?.status ?? 'PENDING';
        return [status, ...statusTransitions.value[status]];
    });

    function hydrateEditForm(booking: BookingCalendarRecord) {
        editForm.value = {
            startsAt: toDateTimeLocalValue(booking.startsAt),
            endsAt: toDateTimeLocalValue(booking.endsAt),
            requesterName: booking.requesterName,
            requesterEmail: booking.requesterEmail,
            groupId: booking.groupId ?? '',
            safeReference: booking.safeReference,
            safePin: booking.safePin,
        };
    }

    function openAction(selection: BookingActionSelection) {
        const booking = options.getBookingById(selection.bookingId);
        if (!booking) return;

        selectedBookingId.value = selection.bookingId;
        currentAction.value = selection.action;
        pendingStatus.value = selection.nextStatus ?? booking.status;
        hydrateEditForm(booking);
        isDialogOpen.value = true;
    }

    function closeDialog() {
        isDialogOpen.value = false;
    }

    async function confirmAction(): Promise<BookingCalendarRecord | null> {
        if (!selectedBookingId.value || !currentAction.value) return null;
        isSubmitting.value = true;

        try {
            if (currentAction.value === 'edit') {
                return options.updateBooking(selectedBookingId.value, {
                    startsAt: editForm.value.startsAt,
                    endsAt: editForm.value.endsAt,
                    requesterName: editForm.value.requesterName,
                    requesterEmail: editForm.value.requesterEmail,
                    groupId: editForm.value.groupId || null,
                    safeReference: editForm.value.safeReference,
                    safePin: editForm.value.safePin,
                });
            }

            if (currentAction.value === 'change_status') {
                return options.changeBookingStatus(selectedBookingId.value, pendingStatus.value);
            }

            if (currentAction.value === 'duplicate') {
                return options.duplicateBooking(selectedBookingId.value);
            }

            if (currentAction.value === 'cancel') {
                return options.cancelBooking(selectedBookingId.value);
            }

            return null;
        }
        finally {
            isSubmitting.value = false;
            isDialogOpen.value = false;
        }
    }

    return {
        currentAction,
        isDialogOpen,
        selectedBooking,
        pendingStatus,
        statusOptions,
        editForm,
        isSubmitting,
        openAction,
        closeDialog,
        confirmAction,
    };
}

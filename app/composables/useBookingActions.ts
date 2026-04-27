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

export type BookingEmailOption = 'requester' | 'other';

type UseBookingActionsOptions = {
    getBookingById: (bookingId: string) => BookingCalendarRecord | null;
    updateBooking: (bookingId: string, patch: Partial<Omit<BookingCalendarRecord, 'id'>>) => BookingCalendarRecord | null;
    changeBookingStatus: (
        bookingId: string,
        status: BookingApiStatus,
        context?: {
            note?: string;
            sendEmail?: boolean;
            email?: string;
            safeReference?: string;
            safePin?: string;
        },
    ) => BookingCalendarRecord | null;
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
    const { t } = useI18n();
    const selectedBookingId = ref<string | null>(null);
    const currentAction = ref<BookingActionType | null>(null);
    const isDialogOpen = ref(false);
    const pendingStatus = ref<BookingApiStatus>('PENDING');
    const isSubmitting = ref(false);
    const statusNote = ref('');
    const sendEmail = ref(false);
    const emailOption = ref<BookingEmailOption>('requester');
    const customEmails = ref('');
    const emailError = ref('');
    const showSafeFields = ref(false);
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

    function isInternalEmail(email: string | undefined): boolean {
        if (!email) return false;
        const domain = email.split('@')[1]?.toLowerCase();
        return domain ? internalEmailDomains.includes(domain) : false;
    }

    function validateEmails(emailString: string): boolean {
        if (!emailString.trim()) return false;
        const emails = emailString.split(',').map(e => e.trim().toLowerCase());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every(email => emailRegex.test(email));
    }

    function isOutsideBusinessWindow(date: Date): boolean {
        const day = date.getDay(); // 0 Sunday, 5 Friday, 6 Saturday
        const minutes = date.getHours() * 60 + date.getMinutes();
        if (day === 0 || day === 6) return true;
        if (day === 5) return minutes >= (14 * 60);
        return minutes >= (16 * 60);
    }

    const shouldAutoShowSafeFields = computed(() => {
        if (pendingStatus.value !== 'APPROVED') return false;
        if (!selectedBooking.value) return false;
        const start = new Date(selectedBooking.value.startsAt);
        const end = new Date(selectedBooking.value.endsAt);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
        return isOutsideBusinessWindow(start) || isOutsideBusinessWindow(end);
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
        statusNote.value = '';
        sendEmail.value = false;
        emailOption.value = 'requester';
        customEmails.value = '';
        emailError.value = '';
        showSafeFields.value = false;
        isDialogOpen.value = true;
    }

    function closeDialog() {
        isDialogOpen.value = false;
        statusNote.value = '';
        sendEmail.value = false;
        emailOption.value = 'requester';
        customEmails.value = '';
        emailError.value = '';
        showSafeFields.value = false;
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
                let email: string | undefined;

                if (sendEmail.value) {
                    if (emailOption.value === 'other') {
                        if (!validateEmails(customEmails.value)) {
                            emailError.value = t('booking.calendar.action_dialog.email.invalid');
                            return null;
                        }
                        email = customEmails.value
                            .split(',')
                            .map(e => e.trim().toLowerCase())
                            .join(',');
                    }
                    else {
                        email = selectedBooking.value?.requesterEmail;
                        if (!email) {
                            emailError.value = t('booking.calendar.action_dialog.email.required');
                            return null;
                        }
                    }
                }

                return options.changeBookingStatus(selectedBookingId.value, pendingStatus.value, {
                    note: statusNote.value.trim() || undefined,
                    sendEmail: sendEmail.value,
                    email,
                    safeReference: (shouldAutoShowSafeFields.value || showSafeFields.value) ? editForm.value.safeReference : undefined,
                    safePin: (shouldAutoShowSafeFields.value || showSafeFields.value) ? editForm.value.safePin : undefined,
                });
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
            closeDialog();
        }
    }

    return {
        currentAction,
        isDialogOpen,
        selectedBooking,
        pendingStatus,
        statusNote,
        sendEmail,
        emailOption,
        customEmails,
        emailError,
        showSafeFields,
        shouldAutoShowSafeFields,
        isInternalEmail,
        statusOptions,
        editForm,
        isSubmitting,
        openAction,
        closeDialog,
        confirmAction,
    };
}

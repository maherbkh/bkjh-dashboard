import type {
    BookingApiStatus,
    BookingCalendarRecord,
} from '~/composables/useBookingCalendarView';

export type BookingActionType = 'create' | 'edit' | 'change_status' | 'duplicate' | 'cancel' | 'delete';

export type BookingActionSelection = {
    action: BookingActionType;
    /** Not required when action is 'create'. */
    bookingId?: string;
    nextStatus?: BookingApiStatus;
};

export type BookingEditForm = {
    carId: string;
    startsAt: string;
    endsAt: string;
    requesterName: string;
    requesterEmail: string;
    distance: string;
    requesterNote: string;
    adminNote: string;
    groupId: string;
    safeReference: string;
    safePin: string;
};

export type BookingEmailOption = 'requester' | 'other';
export type BookingStatusOption = {
    value: BookingApiStatus;
    label: string;
    disabled: boolean;
};

type BookingStatusOptionApiItem = {
    value: string;
    label?: string;
    disabled?: boolean;
};

type UseBookingActionsOptions = {
    getBookingById: (bookingId: string) => BookingCalendarRecord | null;
    createBooking: (data: {
        carId: string;
        startsAt: string;
        endsAt: string;
        requesterName: string;
        requesterEmail: string;
        distance: number;
        status?: BookingApiStatus;
        requesterNote?: string | null;
        adminNote?: string | null;
        groupId?: string | null;
        safeReference?: string;
        safePin?: string;
        sendEmail?: boolean;
        email?: string;
    }) => Promise<BookingCalendarRecord | null>;
    updateBooking: (
        bookingId: string,
        patch: Partial<Omit<BookingCalendarRecord, 'id'>> & { sendEmail?: boolean; email?: string },
    ) => Promise<BookingCalendarRecord | null>;
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
    ) => Promise<BookingCalendarRecord | null>;
    duplicateBooking: (bookingId: string) => Promise<BookingCalendarRecord | null>;
    cancelBooking: (bookingId: string) => Promise<BookingCalendarRecord | null>;
    deleteBooking: (bookingId: string) => Promise<void>;
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
    const allowEditCar = ref(false);
    const editForm = ref<BookingEditForm>({
        carId: '',
        startsAt: '',
        endsAt: '',
        requesterName: '',
        requesterEmail: '',
        distance: '',
        requesterNote: '',
        adminNote: '',
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

    const statusOptions = ref<BookingStatusOption[]>([]);
    const bookingApiStatuses: BookingApiStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'];

    function isBookingApiStatus(value: string): value is BookingApiStatus {
        return bookingApiStatuses.includes(value as BookingApiStatus);
    }

    async function loadStatusOptions(currentStatus: BookingApiStatus) {
        try {
            const response = await fetchDashboardApi<BookingStatusOptionApiItem[]>('/shared/select-lists/car-booking-statuses', {
                query: { currentStatus },
            });
            const optionsFromApi = response.data ?? [];
            const sanitized = optionsFromApi
                .filter(item => isBookingApiStatus(String(item.value)))
                .map((item) => {
                    const value = item.value as BookingApiStatus;
                    return {
                        value,
                        // Keep translation source in app i18n, same as other CRUD UIs.
                        label: t(`booking.calendar.status_options.${value.toLowerCase()}`),
                        disabled: Boolean(item.disabled),
                    };
                });

            statusOptions.value = sanitized.length > 0
                ? sanitized
                : bookingApiStatuses.map(value => ({
                        value,
                        label: t(`booking.calendar.status_options.${value.toLowerCase()}`),
                        disabled: value === currentStatus,
                    }));
        }
        catch {
            statusOptions.value = bookingApiStatuses.map(value => ({
                value,
                label: t(`booking.calendar.status_options.${value.toLowerCase()}`),
                disabled: value === currentStatus,
            }));
        }
    }

    function hydrateEditForm(booking: BookingCalendarRecord) {
        editForm.value = {
            carId: booking.carId,
            startsAt: toDateTimeLocalValue(booking.startsAt),
            endsAt: toDateTimeLocalValue(booking.endsAt),
            requesterName: booking.requesterName,
            requesterEmail: booking.requesterEmail,
            distance: String(booking.distance ?? ''),
            requesterNote: booking.requesterNote ?? '',
            adminNote: booking.adminNote ?? '',
            groupId: booking.groupId ?? '',
            safeReference: booking.safeReference,
            safePin: booking.safePin ?? '',
        };
    }

    function openAction(selection: BookingActionSelection) {
        currentAction.value = selection.action;
        statusNote.value = '';
        sendEmail.value = selection.action === 'create' || selection.action === 'edit';
        emailOption.value = 'requester';
        customEmails.value = '';
        emailError.value = '';
        showSafeFields.value = false;

        if (selection.action === 'create') {
            selectedBookingId.value = null;
            pendingStatus.value = 'APPROVED';
            allowEditCar.value = true;
            editForm.value = {
                carId: '',
                startsAt: '',
                endsAt: '',
                requesterName: '',
                requesterEmail: '',
                distance: '',
                requesterNote: '',
                adminNote: '',
                groupId: '',
                safeReference: '',
                safePin: '',
            };
            loadStatusOptions('PENDING');
            isDialogOpen.value = true;
            return;
        }

        const booking = options.getBookingById(selection.bookingId ?? '');
        if (!booking) return;

        selectedBookingId.value = selection.bookingId ?? null;
        pendingStatus.value = selection.nextStatus ?? booking.status;
        allowEditCar.value = false;
        hydrateEditForm(booking);
        loadStatusOptions(booking.status);
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
        allowEditCar.value = false;
    }

    async function confirmAction(): Promise<BookingCalendarRecord | null> {
        if (!currentAction.value) return null;
        isSubmitting.value = true;

        try {
            if (currentAction.value === 'create') {
                let createEmail: string | undefined;

                if (sendEmail.value) {
                    if (emailOption.value === 'other') {
                        if (!validateEmails(customEmails.value)) {
                            emailError.value = t('booking.calendar.action_dialog.email.invalid');
                            return null;
                        }
                        createEmail = customEmails.value
                            .split(',')
                            .map(e => e.trim().toLowerCase())
                            .join(',');
                    }
                    else {
                        createEmail = editForm.value.requesterEmail.trim() || undefined;
                        if (!createEmail) {
                            emailError.value = t('booking.calendar.action_dialog.email.required');
                            return null;
                        }
                    }
                }

                return options.createBooking({
                    carId: editForm.value.carId,
                    startsAt: editForm.value.startsAt,
                    endsAt: editForm.value.endsAt,
                    requesterName: editForm.value.requesterName,
                    requesterEmail: editForm.value.requesterEmail,
                    distance: Number(editForm.value.distance || 0),
                    status: pendingStatus.value,
                    requesterNote: editForm.value.requesterNote || null,
                    adminNote: editForm.value.adminNote || null,
                    groupId: editForm.value.groupId || null,
                    safeReference: editForm.value.safeReference || undefined,
                    safePin: editForm.value.safePin || undefined,
                    sendEmail: sendEmail.value,
                    email: createEmail,
                });
            }

            if (!selectedBookingId.value) return null;

            if (currentAction.value === 'delete') {
                await options.deleteBooking(selectedBookingId.value);
                return null;
            }

            if (currentAction.value === 'edit') {
                let editEmail: string | undefined;

                if (sendEmail.value) {
                    if (emailOption.value === 'other') {
                        if (!validateEmails(customEmails.value)) {
                            emailError.value = t('booking.calendar.action_dialog.email.invalid');
                            return null;
                        }
                        editEmail = customEmails.value
                            .split(',')
                            .map(e => e.trim().toLowerCase())
                            .join(',');
                    }
                    else {
                        editEmail = editForm.value.requesterEmail.trim() || undefined;
                        if (!editEmail) {
                            emailError.value = t('booking.calendar.action_dialog.email.required');
                            return null;
                        }
                    }
                }

                return options.updateBooking(selectedBookingId.value, {
                    startsAt: editForm.value.startsAt,
                    endsAt: editForm.value.endsAt,
                    requesterName: editForm.value.requesterName,
                    requesterEmail: editForm.value.requesterEmail,
                    distance: Number(editForm.value.distance || 0),
                    requesterNote: editForm.value.requesterNote || null,
                    adminNote: editForm.value.adminNote || null,
                    groupId: editForm.value.groupId || null,
                    carId: allowEditCar.value ? (editForm.value.carId || selectedBooking.value?.carId || '') : undefined,
                    safeReference: editForm.value.safeReference,
                    safePin: editForm.value.safePin,
                    sendEmail: sendEmail.value,
                    email: editEmail,
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
        allowEditCar,
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

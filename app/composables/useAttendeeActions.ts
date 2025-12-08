import { toast } from 'vue-sonner';

export const useAttendeeActions = () => {
    const { t } = useI18n();
    const isSendingVerificationEmail = ref(false);

    /**
     * Send verification email to attendee
     * 
     * @param attendeeId - Attendee UUID or ID
     * @param refresh - Optional refresh function to call after success
     * @returns Promise that resolves when email is sent
     */
    const sendVerificationEmail = async (
        attendeeId: string | number,
        refresh?: () => Promise<void>,
    ) => {
        isSendingVerificationEmail.value = true;
        try {
            const response = await useApiFetch<{
                success: boolean;
                message: string;
                data?: any;
            }>(`/academy/attendees/${attendeeId}/send-verification-email`, {
                method: 'POST',
            });

            // Show success message from API or fallback to generic message
            if (response.data?.value?.message) {
                toast.success(response.data.value.message);
            }
            else {
                toast.success(t('attendee.verification_email_sent') || 'Verification email sent successfully');
            }

            // Refresh the data if refresh function is provided
            if (refresh) {
                await refresh();
            }
        }
        catch (error: any) {
            console.error('Error sending verification email:', error);

            // Show error message from API or fallback to generic message
            const errorMessage = error?.data?.message || error?.message || t('attendee.verification_email_error') || 'Failed to send verification email';
            toast.error(errorMessage);

            throw error; // Re-throw so calling component can handle it
        }
        finally {
            isSendingVerificationEmail.value = false;
        }
    };

    return {
        sendVerificationEmail,
        isSendingVerificationEmail: readonly(isSendingVerificationEmail),
    };
};


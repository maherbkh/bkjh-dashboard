import { toast } from 'vue-sonner';

export const useTicketActions = () => {
    const { t } = useI18n();
    const route = useRoute();
    const isActionLoading = ref(false);

    // Self assign function
    const assignSelf = async (ticketUuid: string, refresh: () => Promise<void>) => {
        isActionLoading.value = true;
        try {
            await useApiFetch(`/api/ticket/${ticketUuid}/self-assign`, {
                method: 'POST',
            });

            await refresh();
            toast.success(t('tickets.actions.assign'));
            // Refresh the page data
            await navigateTo(route.fullPath, { replace: true });
        }
        catch (error) {
            console.error('Error assigning ticket:', error);
            toast.error('Failed to assign ticket');
        }
        finally {
            isActionLoading.value = false;
        }
    };

    // Transfer function
    const transferTicket = async (ticketUuid: string, userId: number, refresh: () => Promise<void>) => {
        isActionLoading.value = true;
        try {
            await useApiFetch(`/api/ticket/${ticketUuid}/transfer`, {
                method: 'POST',
                body: { user_id: userId },
            });

            toast.success(t('tickets.actions.transfer'));
            // Refresh the page data
            await navigateTo(route.fullPath, { replace: true });
        }
        catch (error) {
            console.error('Error transferring ticket:', error);
            toast.error('Failed to transfer ticket');
        }
        finally {
            isActionLoading.value = false;
        }
    };

    // Add action function
    const addTicketAction = async (ticketUuid: string, actionType: string, note?: string, refresh?: () => Promise<void>) => {
        isActionLoading.value = true;
        try {
            await useApiFetch(`/api/ticket/${ticketUuid}/action`, {
                method: 'POST',
                body: {
                    action_type: actionType,
                    note: note || '',
                },
            });

            toast.success(t(`tickets.actions.${actionType}`));
            if (refresh) {
                await refresh();
            }
            // Refresh the page data
            await navigateTo(route.fullPath, { replace: true });
        }
        catch (error) {
            console.error('Error adding action:', error);
            toast.error('Failed to add action');
        }
        finally {
            isActionLoading.value = false;
        }
    };

    return {
        isActionLoading: readonly(isActionLoading),
        assignSelf,
        transferTicket,
        addTicketAction,
    };
};

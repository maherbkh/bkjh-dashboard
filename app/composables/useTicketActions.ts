import { toast } from 'vue-sonner';
import type { TicketActionType } from '~/types';
import { useUserStore } from '~/stores/user';

export const useTicketActions = () => {
    const { t } = useI18n();
    const route = useRoute();
    const userStore = useUserStore();
    const isActionLoading = ref(false);

    /**
     * Core function: Add action to ticket using the unified API endpoint
     * All ticket actions now use POST /support/tickets/:ticketId/add-action
     * 
     * @param ticketId - Ticket UUID
     * @param targetId - Admin UUID (target of action)
     * @param actionType - Type of action from TicketActionType enum
     * @param note - Optional note describing the action
     * @param refresh - Optional refresh function to call after success
     * @returns Promise that resolves when action is added
     */
    const addAction = async (
        ticketId: string,
        targetId: string,
        actionType: TicketActionType,
        note?: string,
        refresh?: () => Promise<void>,
    ) => {
        isActionLoading.value = true;
        try {
            const response = await useApiFetch<{
                success: boolean;
                message: string;
                data: any;
            }>(`/support/tickets/${ticketId}/add-action`, {
                method: 'POST',
                body: {
                    targetId,
                    actionType,
                    note,
                },
            });

            // Show success message from API or fallback to generic message
            if (response.data?.value?.message) {
                toast.success(response.data.value.message);
            }
            else {
                toast.success(t('action.message.action_added_successfully'));
            }

            // Refresh the ticket data
            if (refresh) {
                await refresh();
            }

            // Reload the current page to show updated data
            await navigateTo(route.fullPath, { replace: true });
        }
        catch (error: any) {
            console.error('Error adding action:', error);
            
            // Show error message from API or fallback to generic message
            const errorMessage = error?.data?.message || error?.message || t('action.message.action_add_failed');
            toast.error(errorMessage);
            
            throw error; // Re-throw so calling component can handle it
        }
        finally {
            isActionLoading.value = false;
        }
    };

    /**
     * Self-assign ticket to current user
     * Uses the new unified add-action API with ASSIGN action type
     */
    const assignSelf = async (ticketId: string, refresh: () => Promise<void>) => {
        const currentUserId = userStore.user?.id;
        if (!currentUserId) {
            toast.error('User not found');
            return;
        }
        await addAction(ticketId, currentUserId, 'ASSIGN', 'Self-assigned ticket', refresh);
    };

    /**
     * Transfer ticket to another user
     * Uses the new unified add-action API with TRANSFER action type
     */
    const transferTicket = async (ticketId: string, targetUserId: string, refresh: () => Promise<void>) => {
        await addAction(ticketId, targetUserId, 'TRANSFER', undefined, refresh);
    };

    /**
     * Add a ticket action (legacy compatibility wrapper)
     * Uses the new unified add-action API
     */
    const addTicketAction = async (
        ticketId: string, 
        actionType: string, 
        note?: string, 
        refresh?: () => Promise<void>
    ) => {
        const currentUserId = userStore.user?.id;
        if (!currentUserId) {
            toast.error('User not found');
            return;
        }
        await addAction(ticketId, currentUserId, actionType as TicketActionType, note, refresh);
    };

    /**
     * Add manual action (alias for the core addAction function)
     * Kept for backward compatibility
     */
    const addManualAction = addAction;

    return {
        isActionLoading: readonly(isActionLoading),
        assignSelf,
        transferTicket,
        addTicketAction,
        addManualAction,
        addAction, // Export core function
    };
};

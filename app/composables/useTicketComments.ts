import { toast } from 'vue-sonner';
import type { TicketComment } from '~/types';

export const useTicketComments = () => {
    const { t } = useI18n();
    const route = useRoute();
    const isCommentLoading = ref(false);

    /**
     * Add a new comment to a ticket
     * 
     * @param ticketId - Ticket UUID
     * @param content - Comment text
     * @param isInternal - Whether comment is internal (default: true)
     * @param refresh - Optional refresh function to call after success
     * @returns Promise that resolves with the created comment
     */
    const addComment = async (
        ticketId: string,
        content: string,
        isInternal: boolean = true,
        refresh?: () => Promise<void>,
    ) => {
        isCommentLoading.value = true;
        try {
            const response = await useApiFetch<{
                success: boolean;
                message: string;
                data: TicketComment;
            }>(`/support/tickets/${ticketId}/comments`, {
                method: 'POST',
                body: {
                    content,
                    isInternal,
                },
            });

            // Show success message from API or fallback to generic message
            if (response.data?.value?.message) {
                toast.success(response.data.value.message);
            }
            else {
                toast.success(t('comment.message.comment_added_successfully'));
            }

            // Refresh the ticket data
            if (refresh) {
                await refresh();
            }

            // Reload the current page to show updated data
            await navigateTo(route.fullPath, { replace: true });

            return response.data?.value?.data;
        }
        catch (error: any) {
            console.error('Error adding comment:', error);
            
            // Show error message from API or fallback to generic message
            const errorMessage = error?.data?.message || error?.message || t('comment.message.comment_add_failed');
            toast.error(errorMessage);
            
            throw error; // Re-throw so calling component can handle it
        }
        finally {
            isCommentLoading.value = false;
        }
    };

    /**
     * Update an existing comment (author only)
     * 
     * @param ticketId - Ticket UUID
     * @param commentId - Comment UUID
     * @param content - Updated comment text
     * @param isInternal - Updated visibility setting
     * @param refresh - Optional refresh function to call after success
     * @returns Promise that resolves with the updated comment
     */
    const updateComment = async (
        ticketId: string,
        commentId: string,
        content?: string,
        isInternal?: boolean,
        refresh?: () => Promise<void>,
    ) => {
        isCommentLoading.value = true;
        try {
            const body: { content?: string; isInternal?: boolean } = {};
            if (content !== undefined) body.content = content;
            if (isInternal !== undefined) body.isInternal = isInternal;

            const response = await useApiFetch<{
                success: boolean;
                message: string;
                data: TicketComment;
            }>(`/support/tickets/${ticketId}/comments/${commentId}`, {
                method: 'PATCH',
                body,
            });

            // Show success message from API or fallback to generic message
            if (response.data?.value?.message) {
                toast.success(response.data.value.message);
            }
            else {
                toast.success(t('comment.message.comment_updated_successfully'));
            }

            // Refresh the ticket data
            if (refresh) {
                await refresh();
            }

            // Reload the current page to show updated data
            await navigateTo(route.fullPath, { replace: true });

            return response.data?.value?.data;
        }
        catch (error: any) {
            console.error('Error updating comment:', error);
            
            // Show error message from API or fallback to generic message
            const errorMessage = error?.data?.message || error?.message || t('comment.message.comment_update_failed');
            toast.error(errorMessage);
            
            throw error; // Re-throw so calling component can handle it
        }
        finally {
            isCommentLoading.value = false;
        }
    };

    /**
     * Delete a comment (super admin only)
     * 
     * @param ticketId - Ticket UUID
     * @param commentId - Comment UUID
     * @param refresh - Optional refresh function to call after success
     * @returns Promise that resolves when comment is deleted
     */
    const deleteComment = async (
        ticketId: string,
        commentId: string,
        refresh?: () => Promise<void>,
    ) => {
        isCommentLoading.value = true;
        try {
            const response = await useApiFetch<{
                success: boolean;
                message: string;
                data: { id: string; deleted: boolean };
            }>(`/support/tickets/${ticketId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            // Show success message from API or fallback to generic message
            if (response.data?.value?.message) {
                toast.success(response.data.value.message);
            }
            else {
                toast.success(t('comment.message.comment_deleted_successfully'));
            }

            // Refresh the ticket data
            if (refresh) {
                await refresh();
            }

            // Reload the current page to show updated data
            await navigateTo(route.fullPath, { replace: true });
        }
        catch (error: any) {
            console.error('Error deleting comment:', error);
            
            // Show error message from API or fallback to generic message
            const errorMessage = error?.data?.message || error?.message || t('comment.message.comment_delete_failed');
            toast.error(errorMessage);
            
            throw error; // Re-throw so calling component can handle it
        }
        finally {
            isCommentLoading.value = false;
        }
    };

    return {
        isCommentLoading: readonly(isCommentLoading),
        addComment,
        updateComment,
        deleteComment,
    };
};

/**
 * Composable for handling file icons and type detection
 */

import type { TicketAttachment } from '~/types';

export const useFileIcon = () => {
    /**
     * Get the appropriate icon for a file based on its properties
     */
    const getFileIcon = (attachment: TicketAttachment): string => {
        if (attachment.mimeType?.startsWith('image/')) {
            return 'solar:gallery-bold';
        }
        if (attachment.mimeType?.includes('pdf')) {
            return 'solar:document-text-bold';
        }
        if (attachment.mimeType?.startsWith('video/')) {
            return 'solar:video-library-bold';
        }
        if (attachment.mimeType?.startsWith('audio/')) {
            return 'solar:music-notes-bold';
        }
        if (attachment.mimeType?.includes('zip') || attachment.mimeType?.includes('archive') 
            || attachment.mimeType?.includes('compressed')) {
            return 'solar:archive-bold';
        }
        if (attachment.mimeType?.includes('spreadsheet') || attachment.filename?.endsWith('.xlsx')
            || attachment.filename?.endsWith('.xls') || attachment.filename?.endsWith('.csv')) {
            return 'solar:table-bold';
        }
        if (attachment.mimeType?.includes('presentation') || attachment.filename?.endsWith('.ppt')
            || attachment.filename?.endsWith('.pptx')) {
            return 'solar:presentation-bold';
        }
        // Default file icon
        return 'solar:file-bold';
    };

    /**
     * Get the human-readable file type label
     */
    const getFileTypeLabel = (attachment: TicketAttachment): string => {
        if (attachment.mimeType?.startsWith('image/')) return 'Image';
        if (attachment.mimeType?.includes('pdf') || attachment.mimeType?.includes('document')) return 'Document';
        if (attachment.mimeType?.startsWith('video/')) return 'Video';
        if (attachment.mimeType?.startsWith('audio/')) return 'Audio';
        return 'File';
    };

    /**
     * Get the appropriate action icon (preview/download)
     */
    const getActionIcon = (attachment: TicketAttachment): string => {
        return attachment.mimeType?.startsWith('image/') ? 'solar:eye-outline' : 'solar:download-outline';
    };

    /**
     * Handle attachment click (preview or download)
     */
    const handleAttachmentClick = (attachment: TicketAttachment) => {
        if (attachment.mimeType?.startsWith('image/')) {
            // Open image in new window
            window.open(attachment.urls.internal, '_blank');
        }
        else {
            // Download file
            window.open(attachment.urls.internal, '_blank');
        }
    };

    return {
        getFileIcon,
        getFileTypeLabel,
        getActionIcon,
        handleAttachmentClick,
    };
};

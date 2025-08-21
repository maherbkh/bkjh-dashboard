/**
 * Composable for handling file icons and type detection
 */

import type { Attachment } from '~/types';

export const useFileIcon = () => {
    /**
     * Get the appropriate icon for a file based on its properties
     */
    const getFileIcon = (attachment: Attachment): string => {
        if (attachment.properties?.isImage) {
            return 'solar:gallery-bold';
        }
        if (attachment.properties?.isDocument || attachment.mimeType?.includes('pdf')) {
            return 'solar:document-text-bold';
        }
        if (attachment.properties?.isVideo) {
            return 'solar:video-library-bold';
        }
        if (attachment.properties?.isAudio) {
            return 'solar:music-notes-bold';
        }
        if (attachment.properties?.extension === 'zip' || attachment.mimeType?.includes('zip')
            || attachment.mimeType?.includes('archive') || attachment.mimeType?.includes('compressed')) {
            return 'solar:archive-bold';
        }
        if (attachment.mimeType?.includes('spreadsheet') || attachment.properties?.extension === 'xlsx'
            || attachment.properties?.extension === 'xls' || attachment.properties?.extension === 'csv') {
            return 'solar:table-bold';
        }
        if (attachment.mimeType?.includes('presentation') || attachment.properties?.extension === 'ppt'
            || attachment.properties?.extension === 'pptx') {
            return 'solar:presentation-bold';
        }
        // Default file icon
        return 'solar:file-bold';
    };

    /**
     * Get the human-readable file type label
     */
    const getFileTypeLabel = (attachment: Attachment): string => {
        if (attachment.properties?.isImage) return 'Image';
        if (attachment.properties?.isDocument) return 'Document';
        if (attachment.properties?.isVideo) return 'Video';
        if (attachment.properties?.isAudio) return 'Audio';
        return 'File';
    };

    /**
     * Get the appropriate action icon (preview/download)
     */
    const getActionIcon = (attachment: Attachment): string => {
        return attachment.properties?.isImage ? 'solar:eye-outline' : 'solar:download-outline';
    };

    /**
     * Handle attachment click (preview or download)
     */
    const handleAttachmentClick = (attachment: Attachment) => {
        if (attachment.properties?.isImage) {
            // Open image in new window
            window.open(attachment.urls?.full, '_blank');
        }
        else {
            // Download file
            window.open(attachment.urls?.download || attachment.links?.download, '_blank');
        }
    };

    return {
        getFileIcon,
        getFileTypeLabel,
        getActionIcon,
        handleAttachmentClick,
    };
};

/**
 * Composable for handling file icons and type detection
 */

import type { TicketAttachment } from '~/types';

export const useFileIcon = () => {
    // Get media proxy utility
    const { getProxyUrl } = useMediaProxy();
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
    const handleAttachmentClick = async (attachment: TicketAttachment) => {
        // Transform URL to use proxy (bypasses CORS)
        const proxyUrl = getProxyUrl(attachment.urls.internal);
        const filename = attachment.filename || 'download';


        if (attachment.mimeType?.startsWith('image/')) {
            // Open image in new tab for preview using proxy URL
            window.open(proxyUrl, '_blank');
        }
        else {
            // Use proxy URL for downloads - this should work without CORS issues
            try {
                // Method 1: Direct download with proxy URL
                const link = document.createElement('a');
                link.href = proxyUrl;
                link.download = filename;
                link.setAttribute('download', filename);
                link.target = '_blank';
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            }
            catch (error) {
                console.error('Direct download failed:', error);

                // Method 2: Fetch with proxy URL as fallback
                try {
                    const response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            Accept: '*/*',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);


                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.setAttribute('download', filename);
                    link.style.display = 'none';
                    link.target = '_blank';

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Cleanup blob URL
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                }
                catch (fetchError) {
                    console.error('Fetch download failed:', fetchError);

                    // Method 3: Final fallback - open in new tab
                    window.open(proxyUrl, '_blank');
                }
            }
        }
    };

    return {
        getFileIcon,
        getFileTypeLabel,
        getActionIcon,
        handleAttachmentClick,
    };
};

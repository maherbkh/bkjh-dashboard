/**
 * Composable for downloading certificates
 * Provides a reusable function to download certificate files from URLs
 */

import { toast } from 'vue-sonner';

export interface Certificate {
    certificateUrl: string;
    expiresAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Composable for handling certificate downloads
 * @returns Object with downloadCertificate function
 */
export function useCertificateDownload() {
    const { t } = useI18n();
    const { formatDateOnly } = useGermanDateFormat();

    /**
     * Sanitizes a string for use in filenames (removes invalid characters)
     * @param str - String to sanitize
     * @returns Sanitized string
     */
    const sanitizeFilename = (str: string): string => {
        return str
            .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid filename characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    };

    /**
     * Downloads a certificate from the provided URL
     * @param certificate - Certificate object containing certificateUrl
     * @param options - Optional parameters for filename generation
     * @param options.attendeeName - Attendee name for filename and error messages
     * @param options.eventTitle - Event title for filename
     * @returns Promise that resolves when download is complete or rejects on error
     */
    const downloadCertificate = async (
        certificate: Certificate,
        options?: {
            attendeeName?: string;
            eventTitle?: string;
        },
    ): Promise<void> => {
        if (!certificate?.certificateUrl) {
            toast.error(
                options?.attendeeName
                    ? t('event.certificate_download_error', { name: options.attendeeName })
                    : t('event.certificate_download_error_generic'),
            );
            return;
        }

        try {
            // Generate filename: eventTitle - certificate createdAt - Attendee Name.pdf
            const parts: string[] = [];
            if (options?.eventTitle) {
                parts.push(sanitizeFilename(options.eventTitle));
            }
            if (certificate.createdAt) {
                const formattedDate = formatDateOnly(certificate.createdAt);
                if (formattedDate) {
                    parts.push(formattedDate);
                }
            }
            if (options?.attendeeName) {
                parts.push(sanitizeFilename(options.attendeeName));
            }

            const filename = parts.length > 0
                ? `${parts.join(' - ')}.pdf`
                : 'certificate.pdf';

            // Fetch the file as blob to ensure download works with custom filename
            // This is necessary because browsers ignore download attribute for cross-origin URLs
            const response = await fetch(certificate.certificateUrl, {
                method: 'GET',
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.setAttribute('download', filename);
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup blob URL after a short delay
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

            toast.success(
                options?.attendeeName
                    ? t('event.certificate_download_success', { name: options.attendeeName })
                    : t('event.certificate_download_success_generic'),
            );
        }
        catch (error) {
            console.error('Error downloading certificate:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : options?.attendeeName
                        ? t('event.certificate_download_error', { name: options.attendeeName })
                        : t('event.certificate_download_error_generic'),
            );
            throw error;
        }
    };

    return {
        downloadCertificate,
    };
}

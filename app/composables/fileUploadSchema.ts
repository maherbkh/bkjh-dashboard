import { z } from 'zod';

// File type definitions
export const FILE_TYPES = {
    image: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'],
        icon: 'solar:gallery-bold',
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'],
    },
    document: {
        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
        icon: 'solar:document-bold',
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'application/vnd.oasis.opendocument.text'],
    },
    video: {
        extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
        icon: 'solar:video-library-bold',
        mimeTypes: ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'],
    },
    audio: {
        extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
        icon: 'solar:music-notes-bold',
        mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/x-ms-wma', 'audio/mp4'],
    },
    archive: {
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
        icon: 'solar:archive-bold',
        mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip', 'application/x-bzip2'],
    },
    spreadsheet: {
        extensions: ['xls', 'xlsx', 'csv', 'ods', 'numbers'],
        icon: 'solar:table-bold',
        mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.oasis.opendocument.spreadsheet'],
    },
    presentation: {
        extensions: ['ppt', 'pptx', 'odp', 'key'],
        icon: 'solar:presentation-bold',
        mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation'],
    },
} as const;

export type FileType = keyof typeof FILE_TYPES;

export function createFileUploadSchema(t: (key: string) => string, options: {
    maxFiles?: number;
    maxSizeMB?: number;
    allowedTypes?: FileType[];
    required?: boolean;
}) {
    const { maxFiles = 1, maxSizeMB = 10, allowedTypes = ['image', 'document'], required = false } = options;

    // Build allowed extensions and mime types
    const allowedExtensions: string[] = [];
    const allowedMimeTypes: string[] = [];

    allowedTypes.forEach((type) => {
        if (FILE_TYPES[type]) {
            allowedExtensions.push(...FILE_TYPES[type].extensions);
            allowedMimeTypes.push(...FILE_TYPES[type].mimeTypes);
        }
    });

    const fileSchema = z.object({
        id: z.string().optional(),
        name: z.string(),
        size: z.number().max(maxSizeMB * 1024 * 1024, t('file.validation.max_size')),
        type: z.string().refine(
            type => allowedMimeTypes.includes(type) || allowedExtensions.some(ext => type.endsWith(ext)),
            t('file.validation.invalid_type'),
        ),
        file: z.instanceof(File).optional(),
        url: z.string().optional(),
        progress: z.number().min(0).max(100).default(0),
        status: z.enum(['pending', 'uploading', 'success', 'error']).default('pending'),
        error: z.string().optional(),
    });

    if (maxFiles === 1) {
        return required
            ? fileSchema
            : z.union([fileSchema, z.literal(null)]);
    }
    else {
        const arraySchema = z.array(fileSchema).max(maxFiles, t('file.validation.max_files'));
        return required
            ? arraySchema
            : z.union([arraySchema, z.literal(null)]);
    }
}

export function getFileIcon(fileType: string, fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    for (const [type, config] of Object.entries(FILE_TYPES)) {
        const c = config as any;
        if (c.extensions.includes(extension || '') || c.mimeTypes.includes(fileType)) {
            return c.icon;
        }
    }

    return 'solar:file-bold';
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFile(file: File, options: {
    maxSizeMB: number;
    allowedTypes: FileType[];
}): { valid: boolean; error?: string } {
    const { maxSizeMB, allowedTypes } = options;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
        return {
            valid: false,
            error: `File size must be less than ${maxSizeMB}MB`,
        };
    }

    // Check file type
    const allowedExtensions: string[] = [];
    const allowedMimeTypes: string[] = [];

    allowedTypes.forEach((type) => {
        if (FILE_TYPES[type]) {
            allowedExtensions.push(...FILE_TYPES[type].extensions);
            allowedMimeTypes.push(...FILE_TYPES[type].mimeTypes);
        }
    });

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedMimeTypes.includes(file.type)
        || (extension && allowedExtensions.includes(extension));

    if (!isValidType) {
        return {
            valid: false,
            error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
        };
    }

    return { valid: true };
}

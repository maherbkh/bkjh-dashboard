/**
 * @deprecated Use MediaEntity from ~/types/media instead
 * This interface is kept for backward compatibility
 */
export interface MediaFile {
    id: string;
    uuid: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    fullUrl?: string;
    width?: number;
    height?: number;
    altText?: string;
    title?: string;
    description?: string;
    accessLevel: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    authId?: string;
    authType?: 'ADMIN' | 'USER';
    directory?: string;
    collectionName?: string;
    sortOrder?: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * @deprecated Use UploadMediaDto from ~/types/media instead
 * This interface is kept for backward compatibility
 */
export interface MediaUploadOptions {
    accessLevel?: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    collectionName?: 'avatar' | 'cover' | 'gallery' | 'attachments' | 'documents' | 'default';
    modelType?: string;
    modelId?: string;
    directory?: string;
    altText?: string;
    title?: string;
    description?: string;
}

/**
 * @deprecated Use MediaQueryDto from ~/types/media instead
 * This interface is kept for backward compatibility
 */
export interface MediaQueryParams {
    page?: number;
    length?: number;
    search?: string;
    accessLevel?: 'SELF' | 'SUPPORT' | 'ACADEMY' | 'PUBLIC';
    collectionName?: string;
    modelType?: string;
    modelId?: string;
    mimeType?: string;
    sort_by?: 'createdAt' | 'updatedAt' | 'filename' | 'size';
    sort_dir?: 'asc' | 'desc';
}

/**
 * @deprecated Use ApiMeta from ~/types/media instead
 * This interface is kept for backward compatibility
 */
export interface MediaPagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface MediaResponse {
    data: MediaFile[];
    pagination: MediaPagination;
}

export interface MediaUploadResponse {
    success: boolean;
    data: MediaFile;
    message?: string;
}

export interface MediaUploadManyResponse {
    success: boolean;
    data: MediaFile[];
    message?: string;
}

export interface MediaValidationError {
    field: string;
    message: string;
}

export interface MediaValidationRules {
    maxSize: number; // in MB
    maxFiles: number;
    allowedTypes: string[];
    deniedTypes: string[];
}

export type MediaFileType = 'image' | 'svg' | 'audio' | 'video' | 'document' | 'archive';

/**
 * @deprecated Use MediaTypeConfig from ~/types/media instead
 * This interface is kept for backward compatibility
 */
export interface MediaTypeConfig {
    mimeTypes: string[];
    extensions: string[];
    maxSize: number; // in MB
    allowedFor: ('dashboard' | 'academy' | 'support')[];
}

// Note: For new code, import directly from the specific type files:
// import { AccessLevel } from '~/types/media/enums'
// import type { MediaEntity } from '~/types/media/entities'
// import { useMediaRepository } from '~/composables/media'

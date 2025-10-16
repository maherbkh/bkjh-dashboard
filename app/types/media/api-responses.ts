import type { MediaEntity, AccessLevel, AuthType } from './entities';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    readonly data: T;
    readonly meta?: ApiMeta;
    readonly message?: string;
    readonly status?: number;
}

/**
 * Pagination metadata
 */
export interface ApiMeta {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly nextPage: number | null;
    readonly prevPage: number | null;
}

/**
 * Single file upload response
 */
export interface UploadResponse {
    readonly id: string;
    readonly uuid: string;
    readonly filename: string;
    readonly mimeType: string;
    readonly size: number;
    readonly width?: number;
    readonly height?: number;
    readonly url: string;
    readonly accessLevel: AccessLevel;
    readonly authId?: string;
    readonly authType?: AuthType;
    readonly directory?: string;
    readonly createdAt: string;
}

/**
 * Bulk upload response with success/failure tracking
 */
export interface BulkUploadResponse {
    readonly successful: readonly UploadResponse[];
    readonly failed: readonly UploadFailure[];
    readonly totalCount: number;
    readonly successCount: number;
    readonly failureCount: number;
}

/**
 * Failed upload details
 */
export interface UploadFailure {
    readonly filename: string;
    readonly error: string;
    readonly code: string;
}

/**
 * Media statistics response
 */
export interface MediaStatsResponse {
    readonly totalMedia: number;
    readonly totalSize: number;
    readonly mediaByType: Readonly<Record<string, number>>;
    readonly mediaByAccessLevel: Readonly<Record<string, number>>;
    readonly recentUploads: readonly MediaEntity[];
}

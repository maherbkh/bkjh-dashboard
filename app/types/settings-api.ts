/**
 * Type definitions for Settings API responses and requests
 */

import type { Setting } from './index';
import type { SettingValueType } from './settings';

/**
 * Application domain types
 */
export type AppDomainType = 'SHARED' | 'DASHBOARD' | 'SUPPORT' | 'ACADEMY' | 'SIGNATURE';

/**
 * Setting section with children
 */
export interface SettingSectionWithChildren {
    readonly id: string;
    readonly name: string;
    readonly type: SettingValueType;
    children?: Setting[];
}

/**
 * Uploader value structure
 */
export interface UploaderValue {
    readonly alt: string;
    readonly title: string;
    readonly mediaId: string | null;
    readonly collection: string;
}

/**
 * Setting update payload item
 */
export interface SettingUpdatePayloadItem {
    readonly id: string;
    readonly value: unknown;
}

/**
 * Settings update request payload
 */
export interface SettingsUpdateRequest {
    readonly settings: SettingUpdatePayloadItem[];
}

/**
 * Setting update error
 */
export interface SettingUpdateError {
    readonly settingId: string;
    readonly settingKey: string;
    readonly error: string;
}

/**
 * Settings update response data
 */
export interface SettingsUpdateResponseData {
    readonly success: boolean;
    readonly updatedCount: number;
    readonly errors: SettingUpdateError[];
    readonly updatedSettings: Setting[];
}

/**
 * Settings update API response
 */
export interface SettingsUpdateResponse {
    readonly success: boolean;
    readonly message: string;
    readonly data: SettingsUpdateResponseData;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
    readonly success: false;
    readonly message: string;
    readonly errors?: Array<{
        readonly constraints?: Record<string, string>;
        readonly property?: string;
    }>;
}

/**
 * Validation error structure
 */
export interface ValidationError {
    readonly constraints: Record<string, string>;
    readonly property: string;
}

/**
 * Type guard to check if value is UploaderValue
 */
export function isUploaderValue(value: unknown): value is UploaderValue {
    return (
        typeof value === 'object'
        && value !== null
        && 'mediaId' in value
        && ('alt' in value || 'title' in value || 'collection' in value)
    );
}

/**
 * Type guard to check if value is an array of SettingSectionWithChildren
 */
export function isSettingSectionsArray(value: unknown): value is SettingSectionWithChildren[] {
    return Array.isArray(value) && value.every(
        (item): item is SettingSectionWithChildren =>
            typeof item === 'object'
            && item !== null
            && 'id' in item
            && 'name' in item
            && 'type' in item
            && typeof item.id === 'string'
            && typeof item.name === 'string',
    );
}

/**
 * Type guard to check if error is ApiErrorResponse
 */
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
    return (
        typeof error === 'object'
        && error !== null
        && 'success' in error
        && error.success === false
        && 'message' in error
        && typeof (error as ApiErrorResponse).message === 'string'
    );
}

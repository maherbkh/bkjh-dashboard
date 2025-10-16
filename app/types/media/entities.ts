import type { AccessLevel, AuthType } from './enums';

/**
 * Core MediaEntity interface with readonly fields for immutability
 * This represents the complete media file entity from the API
 */
export interface MediaEntity {
    readonly id: string;
    readonly uuid: string;
    readonly filename: string;
    readonly storedName: string;
    readonly path: string;
    readonly url?: string; // For compatibility with getImageSrc
    readonly mimeType: string;
    readonly extension: string;
    readonly size: number;
    readonly width?: number;
    readonly height?: number;
    readonly duration?: number;
    readonly altText?: string;
    readonly title?: string;
    readonly description?: string;
    readonly metadata: Readonly<Record<string, unknown>>;
    readonly accessLevel: AccessLevel;
    readonly authId?: string;
    readonly authType?: AuthType; // Automatically determined by backend, not sent by client
    readonly directory?: string;
    readonly collectionName?: string;
    readonly sortOrder?: number;
    readonly createdAt: string;
    readonly updatedAt: string;
}

/**
 * User interface for permission checking
 * Based on your existing User type from stores/user.ts
 */
export interface User {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly isSuperAdmin: boolean;
    readonly isActive: boolean;
    readonly apps: readonly string[]; // Available apps: 'support', 'academy', etc.
    readonly name?: string;
    readonly avatar?: string;
    readonly lastLoginAt?: string;
    readonly occupation?: string | null;
}

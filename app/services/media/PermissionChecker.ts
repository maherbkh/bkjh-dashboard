import type { User, MediaEntity } from '~/types/media/index';
import { AccessLevel } from '~/types/media/index';

/**
 * Permission checker service
 * Handles all permission logic based on user roles and media ownership
 */
export class PermissionChecker {
    /**
   * Check if user can upload media
   * Dashboard context: Default access level = PUBLIC, no context value needed
   */
    canUpload(user: User | null): boolean {
        if (!user) return false;

        // Super admin can always upload
        if (user.isSuperAdmin) return true;

        // Users with apps can upload
        if (user.apps && user.apps.length > 0) return true;

        return false;
    }

    /**
   * Check if user can delete media
   */
    canDelete(user: User | null, media: MediaEntity): boolean {
        if (!user) return false;

        // Super admin can delete anything
        if (user.isSuperAdmin) return true;

        // User can delete their own media
        if (media.authId === user.id && media.authType === 'ADMIN') return true;

        // Users with support or academy apps can delete media in their scope
        if (user.apps?.some((app: string) => ['support', 'academy'].includes(app))) {
            // Can delete media with SUPPORT or ACADEMY access level
            return media.accessLevel === AccessLevel.SUPPORT || media.accessLevel === AccessLevel.ACADEMY;
        }

        return false;
    }

    /**
   * Check if user can edit media
   */
    canEdit(user: User | null, media: MediaEntity): boolean {
    // Same logic as delete
        return this.canDelete(user, media);
    }

    /**
   * Check if user can view media
   */
    canView(user: User | null, media: MediaEntity): boolean {
        if (!user) {
            // No user - only PUBLIC media
            return media.accessLevel === AccessLevel.PUBLIC;
        }

        // Super admin can view everything
        if (user.isSuperAdmin) return true;

        // User can view their own media
        if (media.authId === user.id && media.authType === 'ADMIN') return true;

        // Check access level permissions
        switch (media.accessLevel) {
            case AccessLevel.PUBLIC:
                return true;

            case AccessLevel.SELF:
                return media.authId === user.id;

            case AccessLevel.SUPPORT:
                return user.apps?.includes('support') || false;

            case AccessLevel.ACADEMY:
                return user.apps?.includes('academy') || false;

            default:
                return false;
        }
    }

    /**
   * Get allowed access levels for user
   */
    getAllowedAccessLevels(user: User | null): readonly AccessLevel[] {
        if (!user) return [AccessLevel.PUBLIC];

        if (user.isSuperAdmin) {
            return [
                AccessLevel.PUBLIC,
                AccessLevel.SELF,
                AccessLevel.SUPPORT,
                AccessLevel.ACADEMY,
            ];
        }

        const levels: AccessLevel[] = [AccessLevel.PUBLIC, AccessLevel.SELF];

        if (user.apps?.includes('support')) {
            levels.push(AccessLevel.SUPPORT);
        }

        if (user.apps?.includes('academy')) {
            levels.push(AccessLevel.ACADEMY);
        }

        return levels;
    }

    /**
   * Check if user can upload to specific collection
   */
    canUploadToCollection(user: User | null, collectionName: string): boolean {
        if (!user) return false;

        // Super admin can upload to any collection
        if (user.isSuperAdmin) return true;

        // Check collection-specific permissions
        switch (collectionName) {
            case 'avatar':
            case 'cover':
                // Any authenticated user can upload avatars/covers
                return true;

            case 'gallery':
            case 'attachments':
            case 'documents':
                // Users with apps can upload to these collections
                return user.apps && user.apps.length > 0;

            case 'default':
                // Default collection - any authenticated user
                return true;

            default:
                return false;
        }
    }

    /**
   * Check if user can access specific access level
   */
    canAccessLevel(user: User | null, accessLevel: AccessLevel): boolean {
        if (!user) return accessLevel === AccessLevel.PUBLIC;

        if (user.isSuperAdmin) return true;

        switch (accessLevel) {
            case AccessLevel.PUBLIC:
                return true;

            case AccessLevel.SELF:
                return true; // User can always set to SELF

            case AccessLevel.SUPPORT:
                return user.apps?.includes('support') || false;

            case AccessLevel.ACADEMY:
                return user.apps?.includes('academy') || false;

            default:
                return false;
        }
    }

    /**
   * Check if user can upload SVG files
   */
    canUploadSvg(user: User | null): boolean {
        if (!user) return false;
        return user.isSuperAdmin;
    }

    /**
   * Get user's permission summary
   */
    getUserPermissions(user: User | null) {
        if (!user) {
            return {
                canUpload: false,
                canDelete: false,
                canEdit: false,
                allowedAccessLevels: [AccessLevel.PUBLIC],
                canUploadSvg: false,
                isSuperAdmin: false,
            };
        }

        return {
            canUpload: this.canUpload(user),
            canDelete: true, // Will be checked per media item
            canEdit: true, // Will be checked per media item
            allowedAccessLevels: this.getAllowedAccessLevels(user),
            canUploadSvg: this.canUploadSvg(user),
            isSuperAdmin: user.isSuperAdmin,
        };
    }
}

/**
 * Singleton instance for global use
 */
export const permissionChecker = new PermissionChecker();

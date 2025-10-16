import type { User, MediaEntity, AccessLevel } from '~/types/media/index';

import { permissionChecker } from '~/services/media';
import { useUserStore } from '~/stores/user';

/**
 * Media permissions composable
 * Provides reactive permission checks based on current user
 */
export function useMediaPermissions() {
    const userStore = useUserStore();

    /**
   * Get current user
   */
    const currentUser = computed(() => userStore.user);

    /**
   * Check if user can upload media
   */
    const canUpload = computed(() => {
        return permissionChecker.canUpload(currentUser.value);
    });

    /**
   * Check if user can delete specific media
   */
    const canDelete = (media: MediaEntity) => {
        return permissionChecker.canDelete(currentUser.value, media);
    };

    /**
   * Check if user can edit specific media
   */
    const canEdit = (media: MediaEntity) => {
        return permissionChecker.canEdit(currentUser.value, media);
    };

    /**
   * Check if user can view specific media
   */
    const canView = (media: MediaEntity) => {
        return permissionChecker.canView(currentUser.value, media);
    };

    /**
   * Get allowed access levels for current user
   */
    const allowedAccessLevels = computed(() => {
        return permissionChecker.getAllowedAccessLevels(currentUser.value);
    });

    /**
   * Check if user can upload to specific collection
   */
    const canUploadToCollection = (collectionName: string) => {
        return permissionChecker.canUploadToCollection(currentUser.value, collectionName);
    };

    /**
   * Check if user can access specific access level
   */
    const canAccessLevel = (accessLevel: AccessLevel) => {
        return permissionChecker.canAccessLevel(currentUser.value, accessLevel);
    };

    /**
   * Check if user can upload SVG files
   */
    const canUploadSvg = computed(() => {
        return permissionChecker.canUploadSvg(currentUser.value);
    });

    /**
   * Get user's permission summary
   */
    const userPermissions = computed(() => {
        return permissionChecker.getUserPermissions(currentUser.value);
    });

    /**
   * Check if user is super admin
   */
    const isSuperAdmin = computed(() => {
        return currentUser.value?.isSuperAdmin || false;
    });

    /**
   * Check if user has specific app access
   */
    const hasAppAccess = (app: string) => {
        return currentUser.value?.apps?.includes(app) || false;
    };

    /**
   * Check if user has support access
   */
    const hasSupportAccess = computed(() => {
        return hasAppAccess('support');
    });

    /**
   * Check if user has academy access
   */
    const hasAcademyAccess = computed(() => {
        return hasAppAccess('academy');
    });

    /**
   * Filter media list based on view permissions
   */
    const filterViewableMedia = (mediaList: MediaEntity[]) => {
        return mediaList.filter(media => canView(media));
    };

    /**
   * Get accessible collections for current user
   */
    const accessibleCollections = computed(() => {
        const collections = ['default', 'avatar', 'cover'];

        if (hasSupportAccess.value || isSuperAdmin.value) {
            collections.push('gallery', 'attachments', 'documents');
        }

        return collections;
    });

    return {
    // User state
        currentUser,
        isSuperAdmin,
        hasSupportAccess,
        hasAcademyAccess,

        // Permission checks
        canUpload,
        canDelete,
        canEdit,
        canView,
        canUploadToCollection,
        canAccessLevel,
        canUploadSvg,

        // User permissions
        allowedAccessLevels,
        userPermissions,
        accessibleCollections,

        // Utility functions
        hasAppAccess,
        filterViewableMedia,
    };
}

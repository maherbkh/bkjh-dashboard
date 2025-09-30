import type { Admin } from '~/types';

/**
 * Composable to fetch and manage admin list
 * @param options - Configuration options
 * @returns Admin list data and utilities
 */
export const useAdminsList = (options: {
    showSelf?: boolean;
    immediate?: boolean;
} = {}) => {
    const { showSelf = false, immediate = false } = options;

    // Build query string
    const queryString = showSelf ? '' : '?showSelf=false';

    // Fetch admins from the API
    const { data: adminsData, pending: loadingAdmins, refresh: refreshAdmins } = useApiFetch<{
        success: boolean;
        message: string;
        data: Admin[];
    }>(`/shared/select-lists/admins${queryString}`, {
        immediate,
    });

    // Transform API response to clean array
    const admins = computed<Admin[]>(() => {
        if (!adminsData.value) return [];
        if (Array.isArray(adminsData.value)) return adminsData.value;
        if ('data' in adminsData.value && Array.isArray(adminsData.value.data)) {
            return adminsData.value.data;
        }
        return [];
    });

    return {
        admins,
        loadingAdmins,
        refreshAdmins,
    };
};

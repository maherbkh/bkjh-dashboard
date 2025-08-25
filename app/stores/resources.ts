import type { Permission, Role } from '~/types';

export const useResourcesStore = defineStore('resources', () => {
    // Use shallowRef for better memory management with large arrays
    const permissionsGroup = shallowRef<Permission[]>([]);
    const roles = shallowRef<Role[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const lastFetched = ref<number | null>(null);

    // Pagination support to reduce memory usage
    const pageSize = 100;
    const currentPage = ref(0);

    // Get paginated permissions
    const paginatedPermissions = computed(() => {
        const start = currentPage.value * pageSize;
        const end = start + pageSize;
        return permissionsGroup.value.slice(start, end);
    });

    // Check if data is stale (older than 30 minutes)
    const isStale = computed(() => {
        if (!lastFetched.value) return true;
        const thirtyMinutes = 30 * 60 * 1000;
        return Date.now() - lastFetched.value > thirtyMinutes;
    });

    const setPermissionsGroup = (data: Permission[]) => {
        permissionsGroup.value = data;
        lastFetched.value = Date.now();
    };

    const setRoles = (data: Role[]) => {
        roles.value = data;
        lastFetched.value = Date.now();
    };

    const clearPermissionsGroup = () => {
        permissionsGroup.value = [];
        lastFetched.value = null;
        currentPage.value = 0;
        error.value = null;
    };

    const clearRoles = () => {
        roles.value = [];
        lastFetched.value = null;
        error.value = null;
    };

    const fetchPermissionsGroup = async (forceRefresh = false) => {
        // Don't fetch if we have fresh data and not forcing refresh
        if (!forceRefresh && permissionsGroup.value.length > 0 && !isStale.value) {
            return permissionsGroup.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { data } = await useApiFetch<{ data: Permission[] }>('/api/permission-all-grouped');
            if (data.value?.data) {
                setPermissionsGroup(data.value.data);
                saveToLocalStorage();
            }
            return data.value?.data || [];
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch permissions';
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    };

    const fetchRoles = async (forceRefresh = false) => {
        // Don't fetch if we have fresh data and not forcing refresh
        if (!forceRefresh && roles.value.length > 0 && !isStale.value) {
            return roles.value;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { data } = await useApiFetch<{ data: Role[] }>('/api/role-all');
            if (data.value?.data) {
                setRoles(data.value.data);
                saveToLocalStorage();
            }
            return data.value?.data || [];
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch roles';
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    };

    // Load from localStorage with error handling
    const loadFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem('resources-store');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.permissions && Array.isArray(data.permissions)) {
                    permissionsGroup.value = data.permissions;
                }
                if (data.roles && Array.isArray(data.roles)) {
                    roles.value = data.roles;
                }
                lastFetched.value = data.lastFetched || null;
            }
        }
        catch (err) {
            console.warn('Failed to load resources from localStorage:', err);
            clearLocalStorage();
        }
    };

    // Save to localStorage with a compression hint
    const saveToLocalStorage = () => {
        try {
            const data = {
                permissions: permissionsGroup.value,
                roles: roles.value,
                lastFetched: lastFetched.value,
            };
            localStorage.setItem('resources-store', JSON.stringify(data));
        }
        catch (err) {
            console.warn('Failed to save resources to localStorage:', err);
        }
    };

    // Clear localStorage
    const clearLocalStorage = () => {
        try {
            localStorage.removeItem('resources-store');
        }
        catch (err) {
            console.warn('Failed to clear resources from localStorage:', err);
        }
    };

    // Initialize store with smart loading
    const initialize = async () => {
        // Load from localStorage first
        loadFromLocalStorage();

        // Fetch fresh data if stale or empty
        if (isStale.value || permissionsGroup.value.length === 0) {
            await fetchPermissionsGroup();
        }
        if (isStale.value || roles.value.length === 0) {
            await fetchRoles();
        }
    };

    // Clear all data (used on logout)
    const clearAll = () => {
        clearPermissionsGroup();
        clearRoles();
        clearLocalStorage();
    };

    // Get permissions by group (optimized)
    const getPermissionsByGroup = (groupName: string) => {
        return permissionsGroup.value.filter(p => p.group === groupName);
    };

    // Get permission by ID (optimized)
    const getPermissionById = (id: number) => {
        return permissionsGroup.value.find(p => p.id === id);
    };

    // Get role by ID (optimized)
    const getRoleById = (id: number) => {
        return roles.value.find(r => r.id === id);
    };

    // Get role by name (optimized)
    const getRoleByName = (name: string) => {
        return roles.value.find(r => r.name === name);
    };

    // Get total count
    const totalCount = computed(() => permissionsGroup.value.length);
    const rolesCount = computed(() => roles.value.length);

    // Get current page info
    const currentPageInfo = computed(() => ({
        current: currentPage.value,
        total: Math.ceil(permissionsGroup.value.length / pageSize),
        hasNext: (currentPage.value + 1) * pageSize < permissionsGroup.value.length,
        hasPrev: currentPage.value > 0,
    }));

    return {
        // State
        permissionsGroup,
        roles,
        paginatedPermissions,
        isLoading,
        error,
        lastFetched,
        currentPage,

        // Getters
        isStale,
        totalCount,
        rolesCount,
        currentPageInfo,
        getPermissionsByGroup,
        getPermissionById,
        getRoleById,
        getRoleByName,

        // Actions
        setPermissionsGroup,
        setRoles,
        clearPermissionsGroup,
        clearRoles,
        fetchPermissionsGroup,
        fetchRoles,
        loadFromLocalStorage,
        saveToLocalStorage,
        clearLocalStorage,
        initialize,
        clearAll,
    };
});

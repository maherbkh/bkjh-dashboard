// Generic resources store for public API data
// Prepared for future public APIs: groups, addresses, companies, occupations

import type { Category, Group, Address, Company, Occupation, PublicDataResponse, PublicData } from '~/types/index';

export const useResourcesStore = defineStore('resources', () => {
    // State
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const lastFetched = ref<number | null>(null);

    // Public data state
    const categories = ref<Category[]>([]);
    const groups = ref<Group[]>([]);
    const addresses = ref<Address[]>([]);
    const companies = ref<Company[]>([]);
    const occupations = ref<Occupation[]>([]);
    const meta = ref<PublicData['meta'] | null>(null);

    // Check if data is stale (older than 30 minutes)
    const isStale = computed(() => {
        if (!lastFetched.value) return true;
        const thirtyMinutes = 30 * 60 * 1000;
        return Date.now() - lastFetched.value > thirtyMinutes;
    });

    // Fetch public data from single endpoint
    const fetchPublicData = async (forceRefresh = false): Promise<PublicData> => {
        if (!forceRefresh && !isStale.value && categories.value.length > 0) {
            return {
                categories: categories.value,
                groups: groups.value,
                addresses: addresses.value,
                companies: companies.value,
                occupations: occupations.value,
                meta: meta.value!
            };
        }

        isLoading.value = true;
        error.value = null;

        try {
            const { data: response } = await useApiFetch<PublicDataResponse>('/api/public-data');
            
            if (response.value && response.value.data) {
                const publicData = response.value.data;
                categories.value = publicData.categories;
                groups.value = publicData.groups;
                addresses.value = publicData.addresses;
                companies.value = publicData.companies;
                occupations.value = publicData.occupations;
                meta.value = publicData.meta;
                lastFetched.value = Date.now();
                
                return publicData;
            }

            return {
                categories: [],
                groups: [],
                addresses: [],
                companies: [],
                occupations: [],
                meta: {
                    timestamp: new Date().toISOString(),
                    counts: {
                        categories: 0,
                        groups: 0,
                        addresses: 0,
                        companies: 0,
                        occupations: 0
                    }
                }
            };
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch public data';
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    };

    // Refetch function for fresh data
    const refetchPublicData = async (): Promise<PublicData> => {
        return await fetchPublicData(true);
    };

    // Clear all data (used on logout)
    const clearAll = () => {
        error.value = null;
        lastFetched.value = null;
        categories.value = [];
        groups.value = [];
        addresses.value = [];
        companies.value = [];
        occupations.value = [];
        meta.value = null;
    };

    return {
        // State
        isLoading,
        error,
        lastFetched,

        // Public data state
        categories: readonly(categories),
        groups: readonly(groups),
        addresses: readonly(addresses),
        companies: readonly(companies),
        occupations: readonly(occupations),
        meta: readonly(meta),

        // Getters
        isStale,

        // Actions
        fetchPublicData,
        refetchPublicData,
        clearAll,
    };
});
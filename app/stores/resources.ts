// Admin resources store for authenticated API data
// Fetches admin data from /api/v1/dashboard/auth/admin-data

// Types based on API response
interface Address {
    id: string;
    streetName: string;
    buildingNumber: string;
    postalCode: string;
    city: string;
    createdAt: string;
    updatedAt: string;
}

interface TicketCategory {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
}

interface EventCategory {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
}

interface Group {
    id: string;
    name: string;
    isActive: boolean;
    address: Address;
}

interface Company {
    id: string;
    name: string;
    location: string;
    register: string;
    partner: {
        name: string;
        location: string;
        register: string;
    };
    management: string;
    addressId: string | null;
    position: number;
    createdAt: string;
    updatedAt: string;
    address: Address | null;
    groups: any[]; // CompanyGroup[] - simplified for now
}

interface Occupation {
    id: string;
    name: string;
    position: number;
    isActive: boolean;
}

interface AdminData {
    categories: {
        ticketCategories: TicketCategory[];
        eventCategories: EventCategory[];
    };
    groups: Group[];
    addresses: Address[];
    companies: Company[];
    occupations: Occupation[];
}

interface AdminDataResponse {
    status: boolean;
    message: string;
    data: AdminData;
}

export const useResourcesStore = defineStore('resources', () => {
    // State
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const lastFetched = ref<number | null>(null);

    // Admin data state
    const ticketCategories = ref<TicketCategory[]>([]);
    const eventCategories = ref<EventCategory[]>([]);
    const groups = ref<Group[]>([]);
    const addresses = ref<Address[]>([]);
    const companies = ref<Company[]>([]);
    const occupations = ref<Occupation[]>([]);

    // Check if data is stale (older than 30 minutes)
    const isStale = computed(() => {
        if (!lastFetched.value) return true;
        const thirtyMinutes = 30 * 60 * 1000;
        return Date.now() - lastFetched.value > thirtyMinutes;
    });

    // Fetch admin data from authenticated endpoint
    const fetchAdminData = async (forceRefresh = false): Promise<AdminData> => {
        if (!forceRefresh && !isStale.value && ticketCategories.value.length > 0) {
            return {
                categories: {
                    ticketCategories: ticketCategories.value,
                    eventCategories: eventCategories.value,
                },
                groups: groups.value,
                addresses: addresses.value,
                companies: companies.value,
                occupations: occupations.value,
            };
        }

        isLoading.value = true;
        error.value = null;

        try {
            // Check if we have an access token before making the request
            const accessToken = useCookie('BKJH_ACCESS_TOKEN');
            if (!accessToken.value) {
                console.warn('No access token available for admin data request, skipping fetch');
                return {
                    categories: {
                        ticketCategories: [],
                        eventCategories: [],
                    },
                    groups: [],
                    addresses: [],
                    companies: [],
                    occupations: [],
                };
            }

            const { data: response, error } = await useApiFetch<AdminDataResponse>('/api/v1/dashboard/auth/admin-data');

            if (error.value) {
                throw new Error(`API Error: ${error.value.statusCode} - ${error.value.data?.message || error.value.message}`);
            }

            if (response.value && response.value.status && response.value.data) {
                const adminData = response.value.data;
                ticketCategories.value = adminData.categories.ticketCategories;
                eventCategories.value = adminData.categories.eventCategories;
                groups.value = adminData.groups;
                addresses.value = adminData.addresses;
                companies.value = adminData.companies;
                occupations.value = adminData.occupations;
                lastFetched.value = Date.now();

                return adminData;
            }

            throw new Error('Invalid response format');
        }
        catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch admin data';
            throw err;
        }
        finally {
            isLoading.value = false;
        }
    };

    // Refetch function for fresh data
    const refetchAdminData = async (): Promise<AdminData> => {
        return await fetchAdminData(true);
    };

    // Clear all data (used on logout)
    const clearAll = () => {
        error.value = null;
        lastFetched.value = null;
        ticketCategories.value = [];
        eventCategories.value = [];
        groups.value = [];
        addresses.value = [];
        companies.value = [];
        occupations.value = [];
    };

    return {
    // State
        isLoading,
        error,
        lastFetched,

        // Admin data state
        ticketCategories: readonly(ticketCategories),
        eventCategories: readonly(eventCategories),
        groups: readonly(groups),
        addresses: readonly(addresses),
        companies: readonly(companies),
        occupations: readonly(occupations),

        // Getters
        isStale,

        // Actions
        fetchAdminData,
        refetchAdminData,
        clearAll,
    };
});

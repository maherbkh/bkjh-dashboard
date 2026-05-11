// Admin resources store for authenticated API data
// Fetches admin data from /auth/admin-data

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

interface EventTarget {
    id: string;
    name: string;
    code: string;
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
    eventTargets: EventTarget[];
}

/** Backend may use `success` (prod API) or `status` (legacy) */
interface AdminDataResponse {
    success?: boolean;
    status?: boolean;
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
    const eventTargets = ref<EventTarget[]>([]);

    // Check if data is stale (older than 30 minutes)
    const isStale = computed(() => {
        if (!lastFetched.value) return true;
        const thirtyMinutes = 30 * 60 * 1000;
        return Date.now() - lastFetched.value > thirtyMinutes;
    });

    // Defaults helper
    const getEmptyAdminData = (): AdminData => ({
        categories: {
            ticketCategories: [],
            eventCategories: [],
        },
        groups: [],
        addresses: [],
        companies: [],
        occupations: [],
        eventTargets: [],
    });

    /** Normalize proxy / useFetch body: AdminData, { data: AdminData }, or { success|status, data: AdminData } */
    function extractAdminDataFromPayload(payload: unknown): AdminData | undefined {
        const asRecord = (v: unknown): Record<string, unknown> | null =>
            v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;

        const tryAdmin = (v: unknown): AdminData | undefined => {
            const o = asRecord(v);
            if (o && 'categories' in o && o.categories != null && typeof o.categories === 'object') {
                return v as AdminData;
            }
            return undefined;
        };

        const direct = tryAdmin(payload);
        if (direct) {
            return direct;
        }

        const root = asRecord(payload);
        if (!root || !('data' in root) || root.data == null) {
            return undefined;
        }

        const inner = tryAdmin(root.data);
        if (inner) {
            return inner;
        }

        const mid = asRecord(root.data);
        if (mid && 'data' in mid) {
            return tryAdmin(mid.data);
        }

        return undefined;
    }

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
                eventTargets: eventTargets.value,
            };
        }

        isLoading.value = true;
        error.value = null;

        const { data: response, error: fetchError } = await useApiFetch<AdminDataResponse>('/auth/admin-data');

        if (fetchError.value) {
            error.value = `API Error: ${fetchError.value.statusCode} - ${fetchError.value.data?.message || fetchError.value.message}`;
            isLoading.value = false;
            return getEmptyAdminData();
        }

        if (response.value) {
            const raw = response.value as unknown;
            const adminData = extractAdminDataFromPayload(raw);

            // Check if adminData has the expected structure
            if (adminData && adminData.categories) {
                ticketCategories.value = adminData.categories.ticketCategories || [];
                eventCategories.value = adminData.categories.eventCategories || [];
                groups.value = adminData.groups || [];
                addresses.value = adminData.addresses || [];
                companies.value = adminData.companies || [];
                occupations.value = adminData.occupations || [];
                eventTargets.value = adminData.eventTargets || [];
                lastFetched.value = Date.now();
                isLoading.value = false;
                return adminData;
            }
            else {
                console.error('AdminData missing categories:', adminData);
                error.value = 'Invalid response format - missing categories';
                isLoading.value = false;
                return getEmptyAdminData();
            }
        }

        error.value = 'No response data received';
        isLoading.value = false;
        return getEmptyAdminData();
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
        eventTargets.value = [];
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
        eventTargets: readonly(eventTargets),

        // Getters
        isStale,

        // Actions
        fetchAdminData,
        refetchAdminData,
        clearAll,
    };
});

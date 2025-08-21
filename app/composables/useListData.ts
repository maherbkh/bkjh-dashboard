type ApiResponse<T> = {
    data: {
        data: T[];
        meta?: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
        links?: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
    };
};

type Group = {
    id: number;
    name: string;
    slug?: string;
    address?: {
        id: number;
        street: string;
        number: string;
        postalCode: string;
        city: string;
        createdAt: string;
        updatedAt: string;
    };
    companies?: {
        id: number;
        name: string;
        location: string;
        register: string;
        partner: string;
        partnerLocation: string;
        partnerRegister: string;
        management: string;
        createdAt: string;
        updatedAt: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
};

type Address = {
    id: number;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    createdAt: string;
    updatedAt: string;
};

type Company = {
    id: number;
    name: string;
    location: string;
    register: string;
    partner: string;
    partnerLocation: string;
    partnerRegister: string;
    management: string;
    slug?: string;
    logo?: string;
    createdAt: string;
    updatedAt: string;
};

export const useListData = <T = any>(apiSlug: string) => {
    const { data, pending, error, refresh } = useApiFetch<ApiResponse<T>>(`/api/${apiSlug}-list`);

    const items = computed(() => data.value?.data?.data || []);

    return {
        items: items as Ref<T[]>,
        pending,
        error,
        refresh,
    };
};

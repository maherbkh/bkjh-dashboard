import type { Address } from '~/types';

export const useAddressesList = () => {
    const { items, pending, error, refresh } = useListData<Address>('address');

    return {
        data: items,
        loading: pending,
        error,
        refresh,
    };
};

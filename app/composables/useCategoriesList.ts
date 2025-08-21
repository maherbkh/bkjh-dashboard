import type { Category } from '~/types';

export const useCategoriesList = () => {
    const { items, pending, error, refresh } = useListData<Category>('category');

    return {
        categories: items,
        loading: pending,
        error,
        refresh,
    };
};

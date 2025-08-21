export const useCompaniesList = () => {
    const { items, pending, error, refresh } = useListData<Company>('company');

    return {
        data: items,
        loading: pending,
        error,
        refresh,
    };
};

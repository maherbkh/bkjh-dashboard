export const useGroupsList = () => {
    const { items, pending, error, refresh } = useListData<Group>('group');

    return {
        groups: items,
        loading: pending,
        error,
        refresh,
    };
};

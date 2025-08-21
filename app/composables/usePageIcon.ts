import type { NavItem } from '~/types';

export const usePageIcon = (): ComputedRef<string | undefined> => {
    const route = useRoute();
    const navigationData = useNavigationData();

    return computed(() => {
        const currentPath = route.path;

        // Function to recursively search for matching URL in navigation items
        const findIconByPath = (items: NavItem[]): string | undefined => {
            for (const item of items) {
                // Check if current path matches this item's URL
                if (item.url === currentPath) {
                    return item.icon;
                }

                // If this item has nested items, search recursively
                if (item.items && item.items.length > 0) {
                    const nestedIcon = findIconByPath(item.items);
                    if (nestedIcon) {
                        return nestedIcon;
                    }
                }
            }
            return undefined;
        };

        // Search through all navigation items
        return findIconByPath(navigationData.value.navMain);
    });
};

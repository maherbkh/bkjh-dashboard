// Using global types from types/index.d.ts

export const useNavigationData = (): ComputedRef<{
    teams: Array<{
        name: string;
        logo: string;
        plan: string;
    }>;
    navMain: Array<{
        title: string;
        url: string;
        icon: string;
        isActive?: boolean;
        items: Array<{
            title: string;
            url: string;
            icon: string;
        }>;
    }>;
}> => {
    const { t } = useI18n();

    return computed(() => ({
        teams: [
            {
                name: t('sidebar.it_support'),
                logo: 'solar:chat-round-call-linear',
                plan: t('sidebar.ticketing_system'),
            },
            {
                name: t('sidebar.event_calendar'),
                logo: 'solar:calendar-linear',
                plan: t('sidebar.backhaus_academy'),
            },
        ],
        navMain: [
            {
                title: t('global.navigation.dashboard'),
                url: '/',
                icon: 'solar:chart-2-outline',
                items: [],
            },
            {
                title: t('sidebar.master_data'),
                url: '#',
                icon: 'solar:server-2-outline',
                isActive: true,
                items: [
                    {
                        title: t('sidebar.companies'),
                        url: '/master-data/companies',
                        icon: 'solar:buildings-2-outline',
                    },
                    {
                        title: t('sidebar.groups'),
                        url: '/master-data/groups',
                        icon: 'solar:buildings-outline',
                    },
                    {
                        title: t('sidebar.addresses'),
                        url: '/master-data/addresses',
                        icon: 'solar:map-point-outline',
                    },
                    {
                        title: t('sidebar.categories'),
                        url: '/master-data/categories',
                        icon: 'solar:bookmark-linear',
                    },

                ],
            },
            {
                title: t('sidebar.support'),
                url: '#',
                icon: 'solar:headphones-round-sound-outline',
                isActive: false,
                items: [
                    {
                        title: t('sidebar.support_tickets'),
                        url: '/support-tickets',
                        icon: 'solar:ticket-outline',
                    },
                ],
            },
            {
                title: t('sidebar.settings'),
                url: '#',
                icon: 'solar:settings-outline',
                isActive: false,
                items: [
                    {
                        title: t('sidebar.users'),
                        url: '/settings/users',
                        icon: 'solar:users-group-rounded-outline',
                    },
                    {
                        title: t('sidebar.roles'),
                        url: '/settings/roles',
                        icon: 'solar:shield-keyhole-outline',
                    },
                ],
            },
        ],
    }));
};

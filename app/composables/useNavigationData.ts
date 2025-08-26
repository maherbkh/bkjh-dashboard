// Using global types from types/index.d.ts
import { useAppStore } from '~/stores/app'

export const useNavigationData = (): ComputedRef<{
    apps: Array<{
        name: string;
        logo: string;
        slug: string;
    }>;
    navMain: Array<{
        title: string;
        url: string;
        icon: string;
        isActive?: boolean;
        apps: ('support' | 'academy')[];
        items: Array<{
            title: string;
            url: string;
            icon: string;
            apps: ('support' | 'academy')[];
        }>;
    }>;
}> => {
    const { t } = useI18n();
    const appStore = useAppStore();

    return computed(() => {
        const allNavigation = {
        apps: [
            {
                name: t('sidebar.it_support'),
                logo: 'solar:chat-round-call-linear',
                slug: 'support',
            },
            {
                name: t('sidebar.event_calendar'),
                logo: 'solar:calendar-linear',
                slug: 'academy',
            },
        ],
        navMain: [
            {
                title: t('global.navigation.dashboard'),
                url: '/',
                icon: 'solar:chart-2-outline',
                apps: ['support', 'academy'],
                items: [],
            },
            {
                title: t('sidebar.master_data'),
                url: '#',
                icon: 'solar:server-2-outline',
                isActive: true,
                apps: ['support'],
                items: [
                    {
                        title: t('sidebar.companies'),
                        url: '/master-data/companies',
                        icon: 'solar:buildings-2-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('sidebar.groups'),
                        url: '/master-data/groups',
                        icon: 'solar:buildings-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('sidebar.addresses'),
                        url: '/master-data/addresses',
                        icon: 'solar:map-point-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('sidebar.categories'),
                        url: '/master-data/categories',
                        icon: 'solar:bookmark-linear',
                        apps: ['support'],
                    },

                ],
            },
            {
                title: t('sidebar.support'),
                url: '#',
                icon: 'solar:headphones-round-sound-outline',
                isActive: false,
                apps: ['support'],
                items: [
                    {
                        title: t('sidebar.support_tickets'),
                        url: '/support-tickets',
                        icon: 'solar:ticket-outline',
                        apps: ['support'],
                    },
                ],
            },
            {
                title: t('sidebar.settings'),
                url: '#',
                icon: 'solar:settings-outline',
                isActive: false,
                apps: ['support'],
                items: [
                    {
                        title: t('sidebar.users'),
                        url: '/settings/users',
                        icon: 'solar:users-group-rounded-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('sidebar.roles'),
                        url: '/settings/roles',
                        icon: 'solar:shield-keyhole-outline',
                        apps: ['support'],
                    },
                ],
            },
            {
                title: t('sidebar.academy'),
                url: '#',
                icon: 'solar:calendar-linear',
                isActive: false,
                apps: ['academy'],
                items: [
                    {
                        title: t('sidebar.events'),
                        url: '/academy/event/list',
                        icon: 'solar:calendar-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('sidebar.speakers'),
                        url: '/academy/speakers',
                        icon: 'solar:user-speak-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('sidebar.attendees'),
                        url: '/academy/attendee/list',
                        icon: 'solar:users-group-rounded-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('sidebar.event_categories'),
                        url: '/academy/event-categories',
                        icon: 'solar:bookmark-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('sidebar.event_targets'),
                        url: '/academy/event-targets',
                        icon: 'solar:target-outline',
                        apps: ['academy'],
                    },
                ],
            },
        ],
        };

        // Filter navigation items based on current app
        const filteredNavMain = allNavigation.navMain.filter(item => 
            item.apps.includes(appStore.appSlug as 'support' | 'academy')
        ).map(item => ({
            ...item,
            items: item.items.filter(subItem => 
                subItem.apps.includes(appStore.appSlug as 'support' | 'academy')
            )
        })) as Array<{
            title: string;
            url: string;
            icon: string;
            isActive?: boolean;
            apps: ('support' | 'academy')[];
            items: Array<{
                title: string;
                url: string;
                icon: string;
                apps: ('support' | 'academy')[];
            }>;
        }>;

        return {
            apps: allNavigation.apps,
            navMain: filteredNavMain
        };
    });
};

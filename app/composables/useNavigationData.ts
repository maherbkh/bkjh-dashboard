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
                name: t('it_support.singular'),
                logo: 'solar:chat-round-call-linear',
                slug: 'support',
            },
            {
                name: t('academy.plural'),
                logo: 'solar:calendar-linear',
                slug: 'academy',
            },
        ],
        navMain: [
            {
                title: t('global.dashboard'),
                url: '/',
                icon: 'solar:chart-2-outline',
                apps: ['support', 'academy'],
                items: [],
            },
            {
                title: t('global.master_data'),
                url: '#',
                icon: 'solar:server-2-outline',
                isActive: true,
                apps: ['support', 'academy'],
                items: [
                    {
                        title: t('company.plural'),
                        url: '/master-data/companies',
                        icon: 'solar:buildings-2-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('group.plural'),
                        url: '/master-data/groups',
                        icon: 'solar:buildings-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('address.plural'),
                        url: '/master-data/addresses',
                        icon: 'solar:map-point-outline',
                        apps: ['support'],
                    },
                    {
                        title: t('category.plural'),
                        url: '/master-data/categories',
                        icon: 'solar:bookmark-linear',
                        apps: ['support'],
                    },
                    {
                        title: t('occupation.plural'),
                        url: '/master-data/occupations',
                        icon: 'solar:briefcase-outline',
                        apps: ['support', 'academy'],
                    },
                    {
                        title: t('speaker.plural'),
                        url: '/master-data/speakers',
                        icon: 'solar:user-speak-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('attendee.plural'),
                        url: '/master-data/attendee/list',
                        icon: 'solar:users-group-rounded-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('event_category.plural'),
                        url: '/master-data/event-categories',
                        icon: 'solar:bookmark-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('event_target.plural'),
                        url: '/master-data/event-targets',
                        icon: 'solar:target-outline',
                        apps: ['academy'],
                    },
                ],
            },
            {
                title: t('ticket.plural'),
                url: '#',
                icon: 'solar:headphones-round-sound-outline',
                isActive: false,
                apps: ['support'],
                items: [
                    {
                        title: t('ticket.plural'),
                        url: '/support-tickets',
                        icon: 'solar:ticket-outline',
                        apps: ['support'],
                    },
                ],
            },
            {
                title: t('setting.plural'),
                url: '#',
                icon: 'solar:settings-outline',
                isActive: false,
                apps: ['support'],
                items: [
                    {
                        title: t('user.plural'),
                        url: '/settings/users',
                        icon: 'solar:users-group-rounded-outline',
                        apps: ['support'],
                    },
                ],
            },
            {
                title: t('academy.plural'),
                url: '#',
                icon: 'solar:calendar-linear',
                isActive: false,
                apps: ['academy'],
                items: [
                    {
                        title: t('academy.plural'),
                        url: '/events/list',
                        icon: 'solar:calendar-outline',
                        apps: ['academy'],
                    },
                    {
                        title: t('action.add') + ' ' + t('academy.singular'),
                        url: '/events/add',
                        icon: 'solar:add-circle-outline',
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

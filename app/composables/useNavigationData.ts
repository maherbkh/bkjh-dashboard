// Using global types from types/index.d.ts
import { useAppStore } from '~/stores/app';
import { useUserStore } from '~/stores/user';

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
        apps: ('support' | 'academy' | 'dashboard')[];
        requireSuperAdmin?: boolean;
        items: Array<{
            title: string;
            url: string;
            icon: string;
            apps: ('support' | 'academy')[];
            requireSuperAdmin?: boolean;
        }>;
    }>;
}> => {
    const { t } = useI18n();
    const appStore = useAppStore();

    return computed(() => {
        const userStore = useUserStore();
        const isSuperAdmin = userStore.user?.isSuperAdmin || false;

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
                    apps: ['support', 'academy', 'dashboard'],
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
                            apps: [],
                            requireSuperAdmin: true,
                        },
                        {
                            title: t('group.plural'),
                            url: '/master-data/groups',
                            icon: 'solar:buildings-outline',
                            apps: ['support', 'academy'],
                        },
                        {
                            title: t('address.plural'),
                            url: '/master-data/addresses',
                            icon: 'solar:map-point-outline',
                            apps: ['support'],
                            requireSuperAdmin: true,
                        },
                        {
                            title: t('category.plural'),
                            url: '/master-data/categories',
                            icon: 'solar:bookmark-linear',
                            apps: ['support'],
                        },
                        {
                            title: t('speaker.plural'),
                            url: '/master-data/speakers',
                            icon: 'solar:user-speak-outline',
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
                        {
                            title: t('occupation.plural'),
                            url: '/master-data/occupations',
                            icon: 'solar:case-round-minimalistic-line-duotone',
                            apps: ['support', 'academy'],
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
                    title: t('academy.plural'),
                    url: '#',
                    icon: 'solar:calendar-linear',
                    isActive: false,
                    apps: ['academy'],
                    items: [
                        {
                            title: t('academy.plural'),
                            url: '/events',
                            icon: 'solar:calendar-outline',
                            apps: ['academy'],
                        },
                        {
                            title: t('action.add') + ' ' + t('academy.singular'),
                            url: '/events/add',
                            icon: 'solar:add-circle-outline',
                            apps: ['academy'],
                        },
                        {
                            title: t('attendee.plural'),
                            url: '/events/attendees',
                            icon: 'solar:users-group-rounded-outline',
                            apps: ['academy'],
                        },
                    ],
                },
                {
                    title: t('setting.plural'),
                    url: '#',
                    icon: 'solar:settings-outline',
                    isActive: false,
                    apps: [],
                    requireSuperAdmin: true,
                    items: [
                        {
                            title: t('admin.plural'),
                            url: '/settings/admins',
                            icon: 'solar:users-group-rounded-outline',
                            apps: [],
                            requireSuperAdmin: true,
                        },

                    ],
                },
            ],
        };

        // Filter navigation items based on current app and super admin requirements
        const filteredNavMain = allNavigation.navMain.filter((item: any) => {
            // Check if item requires super admin
            if (item.requireSuperAdmin && !isSuperAdmin) {
                return false;
            }
            // For super admin items, show them regardless of app
            if (item.requireSuperAdmin && isSuperAdmin) {
                return true;
            }
            // Check if item is for current app
            return item.apps.includes(appStore.appSlug as 'support' | 'academy');
        }).map((item: any) => ({
            ...item,
            items: item.items.filter((subItem: any) => {
                // Check if sub-item requires super admin
                if (subItem.requireSuperAdmin && !isSuperAdmin) {
                    return false;
                }
                // For super admin sub-items, show them regardless of app
                if (subItem.requireSuperAdmin && isSuperAdmin) {
                    return true;
                }
                // Check if sub-item is for current app
                return subItem.apps.includes(appStore.appSlug as 'support' | 'academy');
            }),
        }));

        return {
            apps: allNavigation.apps,
            navMain: filteredNavMain,
        };
    });
};

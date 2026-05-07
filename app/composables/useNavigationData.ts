// Using global types from types/index.d.ts
import type { AppSlug } from '~/types/app';
import { useAppStore } from '~/stores/app';
import { useUserStore } from '~/stores/user';

export const useNavigationData = (): ComputedRef<{
    apps: Array<{
        name: string;
        logo: string;
        slug: AppSlug;
    }>;
    navMain: Array<{
        title: string;
        url: string;
        icon: string;
        isActive?: boolean;
        apps: AppSlug[];
        requireSuperAdmin?: boolean;
        items: Array<{
            title: string;
            url: string;
            icon: string;
            apps: AppSlug[];
            requireSuperAdmin?: boolean;
        }>;
    }>;
}> => {
    const { t } = useI18n();
    const appStore = useAppStore();

    return computed(() => {
        const userStore = useUserStore();
        const isSuperAdmin = userStore.user?.isSuperAdmin || false;

        const allNavigation: {
            apps: Array<{
                name: string;
                logo: string;
                slug: AppSlug;
                description: string;
            }>;
            navMain: any[];
        } = {
            apps: [
                {
                    name: t('it_support.singular'),
                    logo: 'solar:chat-round-call-linear',
                    slug: 'support',
                    description: t('it_support.description'),
                },
                {
                    name: t('academy.plural'),
                    logo: 'solar:calendar-linear',
                    slug: 'academy',
                    description: t('academy.description'),
                },
                {
                    name: t('booking.plural'),
                    logo: 'solar:calendar-add-outline',
                    slug: 'booking',
                    description: t('booking.description'),
                },
                {
                    name: t('hausmeister.plural'),
                    logo: 'solar:home-smile-outline',
                    slug: 'hausmeister',
                    description: t('hausmeister.description'),
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
                    apps: ['support', 'academy', 'booking'],
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
                        {
                            title: t('car.plural'),
                            url: '/master-data/cars',
                            icon: 'mingcute:car-3-line',
                            apps: ['booking'],
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
                    title: t('booking.plural'),
                    url: '#',
                    icon: 'solar:calendar-mark-outline',
                    isActive: false,
                    apps: ['booking'],
                    items: [
                        {
                            title: t('booking.cars_booking.title'),
                            url: '/booking/cars',
                            icon: 'mingcute:car-3-line',
                            apps: ['booking'],
                        },
                    ],
                },
                {
                    title: t('hausmeister.plural'),
                    url: '#',
                    icon: 'solar:home-smile-outline',
                    isActive: false,
                    apps: ['hausmeister'],
                    items: [
                        {
                            title: t('hausmeister.overview'),
                            url: '/hausmeister',
                            icon: 'solar:home-2-outline',
                            apps: ['hausmeister'],
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
                            title: t('setting.plural'),
                            url: '/settings',
                            icon: 'solar:settings-outline',
                            apps: [],
                            requireSuperAdmin: true,
                        },
                        {
                            title: t('admin.plural'),
                            url: '/settings/admins',
                            icon: 'solar:users-group-rounded-outline',
                            apps: [],
                            requireSuperAdmin: true,
                        },
                        {
                            title: t('queue_job.plural'),
                            url: '/settings/queue-jobs',
                            icon: 'solar:list-check-outline',
                            apps: [],
                            requireSuperAdmin: true,
                        },
                        {
                            title: t('setting.update'),
                            url: '/settings/update-settings',
                            icon: 'solar:refresh-outline',
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
            return item.apps && item.apps.includes(appStore.appSlug as AppSlug);
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
                return subItem.apps && subItem.apps.includes(appStore.appSlug as AppSlug);
            }),
        }));

        return {
            apps: allNavigation.apps,
            navMain: filteredNavMain,
        };
    });
};

import type { AppSlug } from '~/types/app';
import { useAppStore } from '~/stores/app';

export function useApp() {
    const appStore = useAppStore();

    const currentApp = computed(() => appStore.appSlug as AppSlug);
    const isSupport = computed(() => currentApp.value === 'support');
    const isAcademy = computed(() => currentApp.value === 'academy');
    const isDashboard = computed(() => currentApp.value === 'dashboard');
    const isBooking = computed(() => currentApp.value === 'booking');
    const isHausmeister = computed(() => currentApp.value === 'hausmeister');

    const is = (slug: AppSlug) => currentApp.value === slug;

    return {
        currentApp,
        isSupport,
        isAcademy,
        isDashboard,
        isBooking,
        isHausmeister,
        is,
    };
}

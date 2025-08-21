export const useCurrentTenant = () => {
    let tenant = 'unknown';

    if (import.meta.server) {
        const host = useRequestHeaders()['host'] || '';
        if (host.includes('dashboard')) tenant = 'dashboard';
        else if (host.includes('support')) tenant = 'support';
        else if (host.includes('akademie')) tenant = 'academy';
    }
    else {
        const host = window.location.hostname;
        if (host.includes('dashboard')) tenant = 'dashboard';
        else if (host.includes('support')) tenant = 'support';
        else if (host.includes('akademie')) tenant = 'academy';
    }

    return tenant;
};

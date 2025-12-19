export default defineNuxtRouteMiddleware((to) => {
    // Define folder redirects mapping
    const folderRedirects: Record<string, string> = {
        '/master-data': '/master-data/companies',
        // '/settings': '/settings/users',
        // Add more folder redirects as needed
        // '/other-folder': '/other-folder/default-page',
    };

    // Check if the current path exactly matches a folder path that needs redirection
    // We only want to redirect exact matches like /master-data/ or /master-data
    const normalizedPath = to.path.endsWith('/')
        ? to.path.slice(0, -1)
        : to.path;

    if (folderRedirects[normalizedPath]) {
        return navigateTo(folderRedirects[normalizedPath]);
    }

    // Handle event UUID redirect strictly for UUID v4:
    // Only redirect /events/:uuid where :uuid is a real UUID, not words like "add"
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidCandidate = to.path.startsWith('/events/') && to.path.split('/').length === 3
        ? to.path.split('/')[2]
        : '';
    if (uuidCandidate && uuidV4Regex.test(uuidCandidate)) {
        return navigateTo(`/events/${uuidCandidate}/show`);
    }
});

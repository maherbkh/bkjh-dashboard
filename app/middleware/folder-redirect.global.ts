export default defineNuxtRouteMiddleware((to) => {
    // Define folder redirects mapping
    const folderRedirects: Record<string, string> = {
        '/master-data': '/master-data/companies',
        '/settings': '/settings/users',
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

    // Handle event UUID redirect: /events/:uuid -> /events/:uuid/show
    const eventUuidMatch = to.path.match(/^\/events\/([a-f0-9-]+)$/i);
    if (eventUuidMatch) {
        const eventId = eventUuidMatch[1];
        return navigateTo(`/events/${eventId}/show`);
    }
});

export default defineNuxtRouteMiddleware((to) => {
    const tenant = useCurrentTenant()

    if (tenant === 'dashboard') {
        // Define folder redirects mapping
        const folderRedirects: Record<string, string> = {
            '/master-data': '/master-data/companies',
            '/settings': '/settings/users',
            // Add more folder redirects as needed
            // '/other-folder': '/other-folder/default-page',
        }

        // Check if the current path exactly matches a folder path that needs redirection
        // We only want to redirect exact matches like /master-data/ or /master-data
        const normalizedPath = to.path.endsWith('/')
            ? to.path.slice(0, -1)
            : to.path

        if (folderRedirects[normalizedPath]) {
            return navigateTo(folderRedirects[normalizedPath])
        }
    }
})

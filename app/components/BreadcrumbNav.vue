<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const { getTicketNumber, isTicketDetailPage, extractUuidFromPath } = useOpenedTickets();

// Translation mapping for route segments (reactive)
const translationMap = computed(() => ({
    'master-data': t('global.sidebar.master_data'),
    'categories': t('global.sidebar.categories'),
    'companies': t('global.sidebar.companies'),
    'groups': t('global.sidebar.groups'),
}));

const getTranslatedName = (segment: string, fullPath?: string) => {
    // Check if this is a ticket detail page and the segment is a UUID
    if (fullPath && isTicketDetailPage(fullPath)) {
        const uuid = extractUuidFromPath(fullPath);
        if (uuid && uuid === segment) {
            const ticketNumber = getTicketNumber(uuid);
            if (ticketNumber) {
                return ticketNumber;
            }
        }
    }

    return (segment in translationMap.value ? translationMap.value[segment as keyof typeof translationMap.value] : segment)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatRoutePath = (path: string) => {
    if (path === '/') return [];

    // Remove query parameters from the path
    const cleanPath = path.split('?')[0];

    // Process the clean path
    const pathWithoutSlashes = cleanPath?.replace(/^\//, '').replace(/\/$/, '');
    const segments = pathWithoutSlashes?.split('/');

    return segments?.map((segment, index) => {
        let name = getTranslatedName(segment, path);

        if (index === segments.length - 1 && /^\d+$/.test(segment)) {
            name = '__VIEW__'; // Special marker for translation
        }

        // Reconstruct URL for proper navigation
        const url = '/' + segments.slice(0, index + 1).join('/');
        return { name, url };
    });
};

const formattedPath = computed(() => formatRoutePath(route.fullPath));
</script>

<template>
    <Breadcrumb>
        <BreadcrumbList class="flex items-center gap-2">
            <BreadcrumbItem class="intro-x flex items-center">
                <NuxtLink :to="route.fullPath === '/' ? '/' : '/'">
                    <BreadcrumbLink
                        :class="[route.fullPath === '/' ? 'opacity-100' : 'hover:opacity-100 opacity-50 ease-in-out duration-300']"
                    >
                        {{ $t('global.actions.dashboard') }}
                    </BreadcrumbLink>
                </NuxtLink>
                <BreadcrumbSeparator v-if="route.fullPath !== '/'">
                    <Icon
                        class="!size-4 opacity-100 shrink-0 mt-1.5"
                        name="solar:double-alt-arrow-right-line-duotone"
                    />
                </BreadcrumbSeparator>
            </BreadcrumbItem>

            <template v-if="route.fullPath !== '/'">
                <template
                    v-for="(path, i) in formattedPath"
                    :key="i"
                >
                    <BreadcrumbItem class="intro-x flex items-center">
                        <template v-if="formattedPath && i === formattedPath.length - 1">
                            <BreadcrumbPage :class="'opacity-75'">
                                {{ path.name === '__VIEW__' ? $t('global.actions.view') : path.name }}
                            </BreadcrumbPage>
                        </template>
                        <template v-else>
                            <NuxtLink :to="path.url">
                                <BreadcrumbLink
                                    class="ease-in-out duration-300 hover:opacity-100 opacity-75"
                                >
                                    {{ path.name }}
                                </BreadcrumbLink>
                            </NuxtLink>
                            <BreadcrumbSeparator>
                                <Icon
                                    class="!size-4 opacity-50 shrink-0 mt-1.5"
                                    name="solar:double-alt-arrow-right-line-duotone"
                                />
                            </BreadcrumbSeparator>
                        </template>
                    </BreadcrumbItem>
                </template>
            </template>
        </BreadcrumbList>
    </Breadcrumb>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const { getTicketNumber, isTicketDetailPage, extractUuidFromPath } = useOpenedTickets();
const { getEventTitle, isEventDetailPage, extractUuidFromEventPath, version: openedEventsVersion } = useOpenedEvents();

// Translation mapping for route segments (reactive)
const translationMap = computed(() => ({
    'master-data': t('global.master_data'),
    'categories': t('category.plural'),
    'companies': t('company.plural'),
    'groups': t('group.plural'),
    'addresses': t('address.plural'),
    'speakers': t('speaker.plural'),
    'attendee': t('attendee.plural'),
    'event-categories': t('event_category.plural'),
    'event-targets': t('event_target.plural'),
    'academy': t('academy.plural'),
    'events': t('academy.plural'),
    'list': t('common.list'),
    'add': t('action.add'),
    'show': t('common.details'),
    'edit': t('action.edit'),
    'attendees': t('attendee.plural'),
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

    // Check if this is an event detail page and the segment is a UUID
    if (fullPath && isEventDetailPage(fullPath)) {
        const uuid = extractUuidFromEventPath(fullPath);
        if (uuid && uuid === segment) {
            const eventTitle = getEventTitle(uuid);
            if (eventTitle) return eventTitle;
        }
    }

    return (segment in translationMap.value
        ? translationMap.value[segment as keyof typeof translationMap.value]
        : segment
    )
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

const formattedPath = computed(() => {
    // Depend on an opened events version to recalc when the event title arrives
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    openedEventsVersion.value;
    return formatRoutePath(route.fullPath);
});
</script>

<template>
    <Breadcrumb>
        <BreadcrumbList class="lg:flex hidden items-center gap-2">
            <BreadcrumbItem class="intro-x flex items-center">
                <NuxtLink :to="route.fullPath === '/' ? '/' : '/'">
                    <BreadcrumbLink
                        :class="[
                            route.fullPath === '/'
                                ? 'opacity-100'
                                : 'hover:opacity-100 opacity-50 ease-in-out duration-300',
                        ]"
                    >
                        {{ $t("global.dashboard") }}
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
                                {{ path.name === "__VIEW__" ? $t("action.view") : path.name }}
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

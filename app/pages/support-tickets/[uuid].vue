<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Get UUID from route params
const uuid = computed(() => route.params.uuid as string)

// Page configuration
const pageTitle = computed(() => t('tickets.show.title'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('tickets.show.description'))
definePageMeta({
    middleware: 'auth',
})

// Breadcrumb navigation
const breadcrumbItems = computed(() => [
    {
        title: t('global.actions.dashboard'),
        href: '/',
    },
    {
        title: t('tickets.title'),
        href: '/support-tickets',
    },
    {
        title: 'Ticket Details',
        href: route.fullPath,
    },
])
</script>

<template>
    <div class="flex flex-col gap-6">
        <Ticket :uuid="uuid" />
    </div>
</template>

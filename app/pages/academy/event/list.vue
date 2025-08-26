<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('academy.events.title'))
const pageIcon = 'solar:calendar-outline'
const pageDescription = computed(() => t('academy.events.description'))

definePageMeta({
    middleware: 'auth',
})

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
})

// Event handlers
const openAddDialog = () => {
    navigateTo('/academy/event/add')
}
</script>

<template>
    <div>
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon"
            @add-new="openAddDialog"
        >
            <template #actions>
                <!-- Additional actions can be added here later -->
            </template>
        </PageHeaderActions>
        
        <!-- Event list content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Events List Content
        </div>
    </div>
</template>
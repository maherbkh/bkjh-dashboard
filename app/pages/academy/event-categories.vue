<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('academy.event_categories.title'))
const pageIcon = 'solar:bookmark-outline'
const pageDescription = computed(() => t('academy.event_categories.description'))

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
    // Add event category logic will go here
    console.log('Add new event category')
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
        
        <!-- Event categories content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Event Categories Content
        </div>
    </div>
</template>

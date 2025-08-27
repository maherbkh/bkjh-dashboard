<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('event_category.plural'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('event_category.description'))

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
            :page-icon="pageIcon || 'solar:bookmark-outline'"
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

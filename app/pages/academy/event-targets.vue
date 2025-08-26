<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('academy.event_targets.title'))
const pageIcon = 'solar:target-outline'
const pageDescription = computed(() => t('academy.event_targets.description'))

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
    // Add event target logic will go here
    console.log('Add new event target')
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
        
        <!-- Event targets content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Event Targets Content
        </div>
    </div>
</template>

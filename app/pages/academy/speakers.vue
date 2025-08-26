<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('academy.speakers.title'))
const pageIcon = 'solar:user-speak-outline'
const pageDescription = computed(() => t('academy.speakers.description'))

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
    // Add speaker logic will go here
    console.log('Add new speaker')
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
        
        <!-- Speakers content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Speakers Content
        </div>
    </div>
</template>

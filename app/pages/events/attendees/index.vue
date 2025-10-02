<script setup lang="ts">
const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('attendee.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('attendee.description'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// Event handlers
const openAddDialog = () => {
    // Add attendee logic will go here
};
</script>

<template>
    <div>
        <PageHeaderActions
            :page-title="pageTitle"
            :page-icon="pageIcon || 'solar:users-group-rounded-outline'"
            @add-new="openAddDialog"
        >
            <template #actions>
                <!-- Additional actions can be added here later -->
            </template>
        </PageHeaderActions>

        <!-- Attendees list content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            <MediaExample />
        </div>
    </div>
</template>

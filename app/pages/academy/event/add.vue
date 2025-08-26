<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('academy.events.add_title'))
const pageIcon = 'solar:calendar-add-outline'
const pageDescription = computed(() => t('academy.events.add_description'))

definePageMeta({
    middleware: 'auth',
})

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
})
</script>

<template>
    <div>
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon"
        >
            <Button
                variant="outline"
                size="sm"
                @click="$router.back()"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('global.actions.back') }}
            </Button>
        </PageHeader>
        
        <!-- Add event form will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Add Event Form Content
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Page configuration
const pageTitle = computed(() => t('action.add') + ' ' + t('academy.singular'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('action.add') + ' ' + t('academy.singular'))

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
            :icon="pageIcon || 'solar:calendar-add-outline'"
        >
            <Button
                variant="outline"
                size="sm"
                @click="$router.back()"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
        </PageHeader>
        
        <!-- Add event form will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Add Event Form Content
        </div>
    </div>
</template>

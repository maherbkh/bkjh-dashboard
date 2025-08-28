<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('action.edit') + ' ' + t('academy.singular'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('action.edit') + ' ' + t('academy.singular'))

definePageMeta({
    middleware: 'auth',
})

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
})

const eventId = computed(() => route.params.id as string)
</script>

<template>
    <div>
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:pen-outline'"
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
        
        <!-- Edit event form will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Edit Event Form Content for ID: {{ eventId }}
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('academy.events.edit_title'))
const pageIcon = 'solar:pen-outline'
const pageDescription = computed(() => t('academy.events.edit_description'))

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
        
        <!-- Edit event form will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Edit Event Form Content for ID: {{ eventId }}
        </div>
    </div>
</template>

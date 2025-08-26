<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('academy.events.show_title'))
const pageIcon = 'solar:calendar-outline'
const pageDescription = computed(() => t('academy.events.show_description'))

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
            
            <Button
                size="sm"
                @click="navigateTo(`/academy/event/${eventId}/edit`)"
            >
                <Icon name="solar:pen-outline" />
                {{ $t('global.actions.edit') }}
            </Button>
        </PageHeader>
        
        <!-- Event details content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Event Show Content for ID: {{ eventId }}
        </div>
    </div>
</template>

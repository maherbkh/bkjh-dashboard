<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('academy.singular') + ' ' + t('common.details'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('academy.singular') + ' ' + t('common.details'))

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
            :icon="pageIcon || 'solar:calendar-outline'"
        >
            <Button
                variant="outline"
                size="sm"
                @click="$router.back()"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
            
            <Button
                size="sm"
                @click="navigateTo(`/academy/event/${eventId}/edit`)"
            >
                <Icon name="solar:pen-outline" />
                {{ $t('action.edit') }}
            </Button>
        </PageHeader>
        
        <!-- Event details content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Event Show Content for ID: {{ eventId }}
        </div>
    </div>
</template>

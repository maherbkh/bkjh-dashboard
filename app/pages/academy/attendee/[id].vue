<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('academy.attendees.details_title'))
const pageIcon = 'solar:user-outline'
const pageDescription = computed(() => t('academy.attendees.details_description'))

definePageMeta({
    middleware: 'auth',
})

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
})

const attendeeId = computed(() => route.params.id as string)
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
                @click="console.log('Edit attendee:', attendeeId)"
            >
                <Icon name="solar:pen-outline" />
                {{ $t('global.actions.edit') }}
            </Button>
        </PageHeader>
        
        <!-- Attendee details content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Attendee Details Content for ID: {{ attendeeId }}
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

// Page configuration
const pageTitle = computed(() => t('attendee.singular') + ' ' + t('common.details'))
const pageIcon = usePageIcon()
const pageDescription = computed(() => t('attendee.singular') + ' ' + t('common.details'))

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
            :icon="pageIcon || 'solar:user-outline'"
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
                @click="console.log('Edit attendee:', attendeeId)"
            >
                <Icon name="solar:pen-outline" />
                {{ $t('action.edit') }}
            </Button>
        </PageHeader>
        
        <!-- Attendee details content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Attendee Details Content for ID: {{ attendeeId }}
        </div>
    </div>
</template>

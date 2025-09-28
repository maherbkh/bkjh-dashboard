<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Page configuration
const pageTitle = computed(() => t('attendee.plural'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('attendee.plural'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

const eventId = computed(() => route.params.id as string);

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
                <Button
                    variant="outline"
                    size="sm"
                    @click="router.back()"
                >
                    <Icon name="solar:arrow-left-outline" />
                    {{ $t('action.back') }}
                </Button>
            </template>
        </PageHeaderActions>

        <!-- Event attendees content will go here -->
        <div class="text-center text-muted-foreground mt-8">
            Event Attendees Content for Event ID: {{ eventId }}
        </div>
    </div>
</template>

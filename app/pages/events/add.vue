<script setup lang="ts">
const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('action.add') + ' ' + t('event.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.add') + ' ' + t('event.singular'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// Use CRUD for submit flows
const { createItem } = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// State
const isSubmitting = ref(false);
const router = useRouter();

// Form submission
const onSubmit = async (values: EventForm) => {
    isSubmitting.value = true;
    try {
        await createItem(values);
        await navigateTo('/events');
    }
    catch (error) {
        console.error('Error creating event:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

// Cancel handler
const handleCancel = () => {
    router.back();
};
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:calendar-add-outline'"
        >
            <Button
                variant="outline"
                size="sm"
                @click="handleCancel"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
        </PageHeader>

        <EventForm
            mode="add"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @cancel="handleCancel"
        />
    </div>
</template>

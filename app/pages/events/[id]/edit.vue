<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

// Page configuration
const pageTitle = computed(() => t('action.edit') + ' ' + t('event.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.edit') + ' ' + t('event.singular'));

definePageMeta({
    middleware: 'auth',
});

useSeoMeta({
    title: pageTitle,
    ogTitle: pageTitle,
    description: pageDescription,
    ogDescription: pageDescription,
});

// Use route.params.id directly

// CRUD
const { updateItem, fetchItem } = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// State
const editingEvent = ref<EventData | null>(null);
const isSubmitting = ref(false);

// Load event data
onMounted(async () => {
    const res = await fetchItem(route.params.id as string);
    editingEvent.value = (res?.data as any) || null;
});

// Form submission
const onSubmit = async (values: EventForm) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;
    try {
        await updateItem(editingEvent.value.id, values);
        await navigateTo(`/events/${route.params.id as string}`);
    }
    catch (error) {
        console.error('Error updating event:', error);
    }
    finally {
        isSubmitting.value = false;
    }
};

// Cancel handler
const handleCancel = () => {
    navigateTo(`/events/${route.params.id as string}`);
};
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:pen-outline'"
        >
            <NuxtLink :to="`/events/${route.params.id as string}`">
                <Button
                variant="outline"
                size="sm"
            >
                <Icon name="solar:arrow-left-outline" />
                {{ $t('action.back') }}
            </Button>
            </NuxtLink>
        </PageHeader>

        <EventForm
            mode="edit"
            :initial-data="editingEvent"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
        />
    </div>
</template>

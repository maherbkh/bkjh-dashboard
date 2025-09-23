<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

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

const eventId = computed(() => route.params.id as string);

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
    const res = await fetchItem(eventId.value);
    editingEvent.value = (res?.data as any) || null;
});

// Form submission
const onSubmit = async (values: EventForm) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;
    try {
        await updateItem(editingEvent.value.id, values);
        await router.push(`/events/${eventId.value}`);
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
    router.push(`/events/${eventId.value}`);
};
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="pageTitle"
            :icon="pageIcon || 'solar:pen-outline'"
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
            mode="edit"
            :initial-data="editingEvent"
            :is-submitting="isSubmitting"
            @submit="onSubmit"
            @cancel="handleCancel"
        />
    </div>
</template>

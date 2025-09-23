<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Page configuration
const pageTitle = computed(() => t('action.edit') + ' ' + t('academy.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.edit') + ' ' + t('academy.singular'));

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
const { fetchItem, updateItem, resetForm } = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// Dialog state
const isDialogOpen = ref(true);
const dialogMode = ref<'add' | 'edit'>('edit');
const editingEvent = ref<EventData | null>(null);
const isSubmitting = ref(false);

onMounted(async () => {
    const res = await fetchItem(eventId.value);
    editingEvent.value = (res?.data as any) || null;
});

const onSubmitAndClose = async (values: EventForm) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;
    try {
        await updateItem(editingEvent.value.id, values);
        isDialogOpen.value = false;
        resetForm();
        router.back();
    }
    catch (error) {
        console.error('Error updating event:', error);
    }
    finally { isSubmitting.value = false; }
};

const onSubmitAndAddNew = async (values: EventForm) => {
    if (!editingEvent.value) return;
    isSubmitting.value = true;
    try {
        await updateItem(editingEvent.value.id, values);
    }
    catch (error) {
        console.error('Error updating event:', error);
    }
    finally { isSubmitting.value = false; }
};

const handleDialogClose = () => {
    isDialogOpen.value = false;
    resetForm();
    router.back();
};
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

        <LazyEventFormDialog
            v-model:is-dialog-open="isDialogOpen"
            v-model:dialog-mode="dialogMode"
            v-model:editing-event="editingEvent"
            :is-submitting="isSubmitting"
            @submit-and-close="onSubmitAndClose"
            @submit-and-add-new="onSubmitAndAddNew"
            @close-dialog="handleDialogClose"
        />
    </div>
</template>

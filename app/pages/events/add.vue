<script setup lang="ts">
const { t } = useI18n();

// Page configuration
const pageTitle = computed(() => t('action.add') + ' ' + t('academy.singular'));
const pageIcon = usePageIcon();
const pageDescription = computed(() => t('action.add') + ' ' + t('academy.singular'));

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
const { createItem, resetForm } = useCrud<EventData, EventForm>({
    crudPath: 'events',
    tenant: 'academy',
    formSchema: createEventSchema(t),
});

// Dialog state
const isDialogOpen = ref(true);
const dialogMode = ref<'add' | 'edit'>('add');
const editingEvent = ref<EventData | null>(null);
const isSubmitting = ref(false);

const router = useRouter();

const onSubmitAndClose = async (values: EventForm) => {
    isSubmitting.value = true;
    try {
        await createItem(values);
        isDialogOpen.value = false;
        resetForm();
        router.back();
    }
    catch (error) {
        console.error('Error creating event:', error);
    }
    finally { isSubmitting.value = false; }
};

const onSubmitAndAddNew = async (values: EventForm) => {
    isSubmitting.value = true;
    try {
        await createItem(values);
        // keep dialog open for adding more
        resetForm();
    }
    catch (error) {
        console.error('Error creating event:', error);
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
            :icon="pageIcon || 'solar:calendar-add-outline'"
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
